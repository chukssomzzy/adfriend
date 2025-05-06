#!/usr/bin/env node
const REMINDERS_STORAGE_KEY = "reminders";

export interface Reminder {
  id?: number;
  text: string;
  remindAt: string;
  days: string[];
  createdAt?: string;
  repeat?: boolean;
  isPaused?: boolean;
}

/**
 * Retrieves all reminders from Chrome Sync Storage.
 * @returns A promise that resolves with an array of Reminder objects.
 */
export const getReminders = async (): Promise<Array<Reminder>> => {
  const result = await chrome.storage.sync.get(REMINDERS_STORAGE_KEY);
  const reminders = result[REMINDERS_STORAGE_KEY];
  return Array.isArray(reminders) ? reminders : [];
};

/**
 * Saves a new reminder to Chrome Sync Storage.
 * Generates a new ID and createdAt timestamp.
 *
 * @param reminder - The reminder object to save (without ID and createdAt).
 *                   Can accept `days` as Set<string> or string[].
 * @returns A promise that resolves with the saved Reminder object including its new ID.
 */
export const saveReminders = async (reminder: {
  text: string;
  remindAt: string;
  days: Set<string> | string[];
  repeat?: boolean;
  isPaused?: boolean;
}): Promise<Reminder> => {
  const reminders = await getReminders();

  let nextId = 1;
  if (reminders.length > 0) {
    const maxId = reminders.reduce((max, r) => Math.max(max, r.id || 0), 0);
    nextId = maxId + 1;
  }

  const reminderToSave: Reminder = {
    id: nextId,
    text: reminder.text,
    remindAt: reminder.remindAt,
    days: Array.isArray(reminder.days)
      ? reminder.days
      : Array.from(reminder.days || []),
    createdAt: new Date().toISOString(),
    repeat: reminder.repeat,
    isPaused: reminder.isPaused,
  };

  reminders.push(reminderToSave);

  await chrome.storage.sync.set({ [REMINDERS_STORAGE_KEY]: reminders });

  return reminderToSave;
};

/**
 * Deletes a reminder from Chrome Sync Storage by its ID.
 *
 * @param reminderId - The ID of the reminder to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteReminder = async (reminderId: number): Promise<void> => {
  let reminders = await getReminders();
  const initialLength = reminders.length;

  reminders = reminders.filter((reminder) => reminder.id !== reminderId);

  if (reminders.length < initialLength) {
    await chrome.storage.sync.set({ [REMINDERS_STORAGE_KEY]: reminders });
  }
};

/**
 * Toggles the 'isPaused' status of a reminder by its ID.
 *
 * @param reminderId - The ID of the reminder to pause/unpause.
 * @returns A promise that resolves when the update is complete.
 */
export const pauseReminder = async (reminderId: number): Promise<void> => {
  const reminders = await getReminders();
  const reminderIndex = reminders.findIndex(
    (reminder) => reminder.id === reminderId,
  );

  if (reminderIndex !== -1) {
    const reminder = reminders[reminderIndex];
    const updatedReminder = { ...reminder, isPaused: !reminder.isPaused };
    reminders[reminderIndex] = updatedReminder;

    await chrome.storage.sync.set({ [REMINDERS_STORAGE_KEY]: reminders });
  }
};
