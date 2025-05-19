import type { Reminder, ReminderInput } from "./types";

const REMINDERS_STORAGE_KEY = "adFriendReminders";
const MAX_REMINDERS = 100;
const MAX_ITEM_BYTES = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
const MAX_TOTAL_BYTES = chrome.storage.sync.QUOTA_BYTES;

/**
 * Logs messages via console, pre-pending with a source identifier.
 */
function log(
  level: "log" | "warn" | "error",
  message: string,
  data?: unknown,
): void {
  const prefix = "[StorageAPI]";
  if (level === "error") {
    console.error(`${prefix} ${message}`, data);
  } else if (level === "warn") {
    console.warn(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`, data);
  }
}

/**
 * Retrieves all reminders from Chrome Sync Storage.
 * @returns A promise that resolves with an array of Reminder objects.
 */
export async function getAllStoredReminders(): Promise<Reminder[]> {
  try {
    const result = await chrome.storage.sync.get(REMINDERS_STORAGE_KEY);
    const reminders = result[REMINDERS_STORAGE_KEY];
    if (Array.isArray(reminders)) {
      return reminders as Reminder[];
    }
    return [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("error", `Failed to get all reminders: ${errorMessage}`, error);
    throw new Error(`Failed to retrieve reminders: ${errorMessage}`);
  }
}

/**
 * Saves a new reminder or updates an existing one in Chrome Sync Storage.
 * @param reminderInput - The reminder data to save.
 * @returns A promise that resolves with the saved Reminder object.
 */
export async function saveStoredReminder(
  reminderInput: ReminderInput,
): Promise<Reminder> {
  try {
    const reminders = await getAllStoredReminders();
    let finalReminder: Reminder;

    if (reminderInput.id) {
      const index = reminders.findIndex((r) => r.id === reminderInput.id);
      if (index === -1) {
        throw new Error(
          `Reminder with ID ${reminderInput.id} not found for update.`,
        );
      }
      finalReminder = {
        ...reminders[index],
        ...reminderInput,
        days: Array.isArray(reminderInput.days)
          ? reminderInput.days
          : Array.from(reminderInput.days),
        isPaused: reminderInput.isPaused ?? reminders[index].isPaused,
      };
      reminders[index] = finalReminder;
      log("log", "Updated reminder", finalReminder);
    } else {
      if (reminders.length >= MAX_REMINDERS) {
        throw new Error(
          `Cannot save reminder. Maximum of ${MAX_REMINDERS} reminders reached.`,
        );
      }
      const newId = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      finalReminder = {
        id: newId,
        text: reminderInput.text,
        remindAt: reminderInput.remindAt,
        days: Array.isArray(reminderInput.days)
          ? reminderInput.days
          : Array.from(reminderInput.days),
        createdAt: Date.now(),
        isPaused: reminderInput.isPaused ?? false,
      };
      reminders.push(finalReminder);
      log("log", "Created new reminder", finalReminder);
    }

    const remindersByteSize = new TextEncoder().encode(
      JSON.stringify({ [REMINDERS_STORAGE_KEY]: reminders }),
    ).length;
    if (remindersByteSize > MAX_ITEM_BYTES) {
      throw new Error(
        `Reminders data exceeds ${MAX_ITEM_BYTES / 1024}KB limit.`,
      );
    }
    if (remindersByteSize > MAX_TOTAL_BYTES) {
      throw new Error(`Total storage quota exceeded.`);
    }

    await chrome.storage.sync.set({ [REMINDERS_STORAGE_KEY]: reminders });
    return finalReminder;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("error", `Failed to save reminder: ${errorMessage}`, {
      reminderInput,
      error,
    });
    throw new Error(`Failed to save reminder: ${errorMessage}`);
  }
}

/**
 * Deletes a reminder from Chrome Sync Storage by its ID.
 * @param reminderId - The ID of the reminder to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteStoredReminder(reminderId: string): Promise<void> {
  try {
    let reminders = await getAllStoredReminders();
    const initialLength = reminders.length;
    reminders = reminders.filter((reminder) => reminder.id !== reminderId);

    if (reminders.length < initialLength) {
      await chrome.storage.sync.set({ [REMINDERS_STORAGE_KEY]: reminders });
      log("log", `Deleted reminder with ID: ${reminderId}`);
    } else {
      log(
        "warn",
        `Attempted to delete non-existent reminder ID: ${reminderId}`,
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(
      "error",
      `Failed to delete reminder ID ${reminderId}: ${errorMessage}`,
      error,
    );
    throw new Error(`Failed to delete reminder: ${errorMessage}`);
  }
}

/**
 * Toggles the 'isPaused' status of a reminder by its ID.
 * @param reminderId - The ID of the reminder to pause/unpause.
 * @returns A promise that resolves with the updated reminder or undefined if not found.
 */
export async function togglePauseStoredReminder(
  reminderId: string,
): Promise<Reminder | undefined> {
  try {
    const reminders = await getAllStoredReminders();
    const reminderIndex = reminders.findIndex((r) => r.id === reminderId);

    if (reminderIndex !== -1) {
      const reminder = reminders[reminderIndex];
      const updatedReminder = { ...reminder, isPaused: !reminder.isPaused };
      reminders[reminderIndex] = updatedReminder;

      await chrome.storage.sync.set({ [REMINDERS_STORAGE_KEY]: reminders });
      log(
        "log",
        `Toggled pause status for reminder ID ${reminderId}`,
        updatedReminder,
      );
      return updatedReminder;
    } else {
      log(
        "warn",
        `Attempted to toggle pause for non-existent reminder ID: ${reminderId}`,
      );
      return undefined;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(
      "error",
      `Failed to toggle pause for reminder ID ${reminderId}: ${errorMessage}`,
      error,
    );
    throw new Error(`Failed to toggle pause status: ${errorMessage}`);
  }
}
