import {
  getAllStoredReminders,
  saveStoredReminder,
  deleteStoredReminder,
  togglePauseStoredReminder,
} from "@/shared/storage";
import type {
  ServiceWorkerMessage,
  ServiceWorkerResponse,
  Reminder,
  ReminderInput,
  LogMessagePayload,
  ReminderListResponse,
  SingleReminderResponse,
  BasicSuccessResponse,
} from "@/shared/types";
import {
  GET_TODAY_REMINDERS_ACTION,
  GET_ALL_REMINDERS_ACTION,
  SAVE_REMINDER_ACTION,
  DELETE_REMINDER_ACTION,
  PAUSE_REMINDER_ACTION,
  LOG_ACTION,
} from "@/shared/types";

/**
 * Logs messages from the service worker context.
 */
function swLog(
  level: "log" | "warn" | "error",
  message: string,
  data?: unknown,
): void {
  const prefix = "[ServiceWorker]";
  if (level === "error") {
    console.error(`${prefix} ${message}`, data);
  } else if (level === "warn") {
    console.warn(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`, data);
  }
}

/**
 * Handles installation and updates of the extension.
 * Content script injection is now handled by manifest.json.
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  swLog("log", `Extension Installed/Updated. Reason: ${details.reason}`);

  if (details.reason === "install" || details.reason === "update") {
    swLog("log", "Performing initial setup or update tasks if any.");
  }
});

/**
 * Retrieves reminders scheduled for the current day and time.
 * @returns A promise that resolves with an array of active Reminder objects for today.
 */
async function getTodayActiveReminders(): Promise<Reminder[]> {
  const allReminders = await getAllStoredReminders();
  const now = new Date();
  const dayOfWeek = ["SU", "M", "T", "W", "TH", "FR", "SA"][now.getDay()];

  const todayReminders = allReminders.filter((reminder) => {
    if (reminder.isPaused) return false;
    const isRecurringToday = reminder.days.includes(dayOfWeek);
    const isOneTime = reminder.days.length === 0;
    return (
      isRecurringToday ||
      (isOneTime &&
        new Date(reminder.createdAt).toDateString() === now.toDateString())
    );
  });

  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  const relevantReminders = todayReminders.filter((reminder) => {
    const [hour, minute] = reminder.remindAt.split(":").map(Number);
    const reminderTimeMinutes = hour * 60 + minute;
    return reminderTimeMinutes >= currentTimeMinutes - 5;
  });

  relevantReminders.sort((a, b) => {
    const timeA = a.remindAt.split(":").map(Number);
    const timeB = b.remindAt.split(":").map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  return relevantReminders;
}

/**
 * Listens for messages from other parts of the extension.
 */
chrome.runtime.onMessage.addListener(
  (
    request: ServiceWorkerMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ServiceWorkerResponse<unknown>) => void,
  ): boolean => {
    swLog(
      "log",
      `Received action: ${request.action} from ${sender.url || sender.id || "unknown"}`,
      request.payload,
    );

    (async () => {
      try {
        switch (request.action) {
          case GET_ALL_REMINDERS_ACTION: {
            const reminders = await getAllStoredReminders();
            const response: ReminderListResponse = {
              success: true,
              data: reminders,
            };
            sendResponse(response);
            break;
          }
          case GET_TODAY_REMINDERS_ACTION: {
            const reminders = await getTodayActiveReminders();
            const response: ReminderListResponse = {
              success: true,
              data: reminders,
            };
            sendResponse(response);
            break;
          }
          case SAVE_REMINDER_ACTION: {
            const payload = request.payload as ReminderInput;
            const savedReminder = await saveStoredReminder(payload);
            const response: SingleReminderResponse = {
              success: true,
              data: savedReminder,
            };
            sendResponse(response);
            break;
          }
          case DELETE_REMINDER_ACTION: {
            const payload = request.payload as { id: string };
            await deleteStoredReminder(payload.id);
            const response: BasicSuccessResponse = { success: true };
            sendResponse(response);
            break;
          }
          case PAUSE_REMINDER_ACTION: {
            const payload = request.payload as { id: string };
            await togglePauseStoredReminder(payload.id);
            const response: BasicSuccessResponse = { success: true };
            sendResponse(response);
            break;
          }
          case LOG_ACTION: {
            const { level, message, data } =
              request.payload as LogMessagePayload;
            const logSource = sender.tab
              ? `Tab ID ${sender.tab.id}`
              : sender.id || "Extension Popup/Content";
            console[level](`[Log from ${logSource}] ${message}`, data);
            const response: BasicSuccessResponse = { success: true };
            sendResponse(response);
            break;
          }
          default: {
            const unknownAction: never = request;
            swLog(
              "warn",
              `Unknown action received: ${(unknownAction as ServiceWorkerMessage).action}`,
            );
            const response: ServiceWorkerResponse<unknown> = {
              success: false,
              error: `Unknown action: ${(unknownAction as ServiceWorkerMessage).action}`,
            };
            sendResponse(response);
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        swLog(
          "error",
          `Error processing action ${request.action}: ${errorMessage}`,
          error,
        );
        const response: ServiceWorkerResponse<unknown> = {
          success: false,
          error: errorMessage,
        };
        sendResponse(response);
      }
    })();
    return true;
  },
);

swLog("log", "Service worker started and listeners attached.");
