/**
 * Represents a reminder object stored in sync storage.
 */
export interface Reminder {
  id: string;
  text: string;
  remindAt: string; // Format HH:MM
  days: string[]; // Array of day abbreviations: M, T, W, TH, FR, SA, SU
  createdAt: number; // Timestamp
  isPaused: boolean;
}

/**
 * Represents the data structure for creating or updating a reminder.
 * Days can be a Set or an array.
 */
export interface ReminderInput {
  id?: string;
  text: string;
  remindAt: string;
  days: string[] | Set<string>;
  isPaused?: boolean;
}

/**
 * Represents the dimensions of an ad element.
 */
export interface AdSize {
  width: number;
  height: number;
}

/**
 * Interface for the shared configuration object.
 */
export interface Config {
  timestamp: string;
  debug: boolean;
  adSelectors: { [key: string]: string[] };
  adSizes: { display: AdSize[] };
}

/**
 * Interface for a quote object.
 */
export interface Quote {
  text: string;
  author: string;
}

/**
 * Interface for the cached style properties of an ad element.
 */
export interface CachedAdStyle {
  width: number;
  height: number;
  display: string;
  position: string;
  margin: string;
  padding: string;
  float: string;
  alignSelf: string;
  textAlign: string;
}

// --- Service Worker Message Action Types ---
export const GET_TODAY_REMINDERS_ACTION = "getTodayReminders";
export const SAVE_REMINDER_ACTION = "saveReminder";
export const DELETE_REMINDER_ACTION = "deleteReminder";
export const PAUSE_REMINDER_ACTION = "pauseReminder";
export const GET_ALL_REMINDERS_ACTION = "getAllReminders";
export const LOG_ACTION = "log";

// --- Service Worker Message Interfaces ---
export type ServiceWorkerAction =
  | typeof GET_TODAY_REMINDERS_ACTION
  | typeof SAVE_REMINDER_ACTION
  | typeof DELETE_REMINDER_ACTION
  | typeof PAUSE_REMINDER_ACTION
  | typeof GET_ALL_REMINDERS_ACTION
  | typeof LOG_ACTION;

export interface BaseServiceWorkerMessage<
  A extends ServiceWorkerAction,
  P = undefined,
> {
  action: A;
  payload: P;
}

export type GetTodayRemindersMessage = BaseServiceWorkerMessage<
  typeof GET_TODAY_REMINDERS_ACTION
>;
export type GetAllRemindersMessage = BaseServiceWorkerMessage<
  typeof GET_ALL_REMINDERS_ACTION
>;

export type SaveReminderMessage = BaseServiceWorkerMessage<
  typeof SAVE_REMINDER_ACTION,
  ReminderInput
>;

export type DeleteReminderMessage = BaseServiceWorkerMessage<
  typeof DELETE_REMINDER_ACTION,
  { id: string }
>;

export type PauseReminderMessage = BaseServiceWorkerMessage<
  typeof PAUSE_REMINDER_ACTION,
  { id: string }
>;

export interface LogMessagePayload {
  level: "log" | "warn" | "error";
  message: string;
  data?: unknown;
}
export type LogMessage = BaseServiceWorkerMessage<
  typeof LOG_ACTION,
  LogMessagePayload
>;

export type ServiceWorkerMessage =
  | GetTodayRemindersMessage
  | GetAllRemindersMessage
  | SaveReminderMessage
  | DeleteReminderMessage
  | PauseReminderMessage
  | LogMessage;

// --- Service Worker Response Interfaces ---
export interface ServiceWorkerResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ReminderListResponse = ServiceWorkerResponse<Reminder[]>;
export type SingleReminderResponse = ServiceWorkerResponse<Reminder>;
export type BasicSuccessResponse = ServiceWorkerResponse<void>;

// Declare adsbygoogle on the Window interface for content scripts
declare global {
  interface Window {
    adsbygoogle?: unknown[]; // It's an array of objects or functions
  }
}

export interface AdRect {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}
