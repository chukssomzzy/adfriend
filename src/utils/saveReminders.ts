import type {
  Reminder,
  ReminderInput,
  ServiceWorkerMessage,
  ServiceWorkerResponse,
} from "@/shared/types";
import {
  SAVE_REMINDER_ACTION,
  GET_ALL_REMINDERS_ACTION,
  DELETE_REMINDER_ACTION,
  PAUSE_REMINDER_ACTION,
} from "@/shared/types";

/**
 * Sends a message to the service worker and handles the response.
 * @param message - The message object to send to the service worker.
 * @returns A promise that resolves with the data from the service worker response.
 */
async function sendMessageToServiceWorker<TResponseData>(
  message: ServiceWorkerMessage,
): Promise<TResponseData> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      message,
      (response: ServiceWorkerResponse<TResponseData>) => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              `Service worker communication error: ${chrome.runtime.lastError.message}`,
            ),
          );
          return;
        }
        if (response && response.success) {
          resolve(response.data as TResponseData);
        } else {
          reject(
            new Error(
              response?.error || "Unknown error occurred in service worker.",
            ),
          );
        }
      },
    );
  });
}

/**
 * Retrieves all reminders by sending a message to the service worker.
 * @returns A promise that resolves with an array of Reminder objects.
 */
export async function getReminders(): Promise<Reminder[]> {
  const response = await sendMessageToServiceWorker<Reminder[]>({
    action: GET_ALL_REMINDERS_ACTION,
    payload: undefined,
  });
  return response ?? [];
}

/**
 * Saves a reminder by sending a message to the service worker.
 * @param reminderInput - The reminder data to save.
 * @returns A promise that resolves with the saved Reminder object.
 */
export async function saveReminders(
  reminderInput: ReminderInput,
): Promise<Reminder> {
  return sendMessageToServiceWorker<Reminder>({
    action: SAVE_REMINDER_ACTION,
    payload: reminderInput,
  });
}

/**
 * Deletes a reminder by its ID by sending a message to the service worker.
 * @param reminderId - The ID of the reminder to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  return sendMessageToServiceWorker<void>({
    action: DELETE_REMINDER_ACTION,
    payload: { id: reminderId },
  });
}

/**
 * Pauses or unpauses a reminder by its ID by sending a message to the service worker.
 * @param reminderId - The ID of the reminder to toggle pause state.
 * @returns A promise that resolves when the operation is successful.
 */
export async function pauseReminder(reminderId: string): Promise<void> {
  return sendMessageToServiceWorker<void>({
    action: PAUSE_REMINDER_ACTION,
    payload: { id: reminderId },
  });
}
