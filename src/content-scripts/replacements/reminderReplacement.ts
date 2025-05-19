import { ContentReplacement } from "@/content-scripts/contentReplacement";
import type { AdRect, Reminder, ReminderListResponse } from "@/shared/types";
import { GET_TODAY_REMINDERS_ACTION } from "@/shared/types";

/**
 * Replaces ad elements with a list of today's reminders.
 */
export class ReminderReplacement extends ContentReplacement {
  private remindersCache: Reminder[] | null = null;

  /**
   * Initializes a new instance of the ReminderReplacement class.
   */
  constructor() {
    super("adfriend-reminder-template");
  }

  /**
   * Loads today's reminders from the service worker.
   */
  private async loadReminders(): Promise<void> {
    try {
      const response = (await chrome.runtime.sendMessage({
        action: GET_TODAY_REMINDERS_ACTION,
      })) as ReminderListResponse;
      if (response.success && response.data) {
        this.remindersCache = response.data;
      } else {
        console.warn("AdFriend: Failed to load reminders -", response.error);
        this.remindersCache = [];
      }
    } catch (error: unknown) {
      console.error("AdFriend: Error loading reminders:", error);
      this.remindersCache = [];
    }
  }

  /**
   * Creates a reminder box element.
   * @param adRect - The bounding rectangle of the ad being replaced.
   * @returns A promise that resolves to the HTMLElement for the reminder box, or null.
   */
  public async createElement(adRect?: AdRect): Promise<HTMLElement | null> {
    const templateElement = document.getElementById(
      this.templateId,
    ) as HTMLTemplateElement | null;
    if (!templateElement) {
      console.warn(
        `AdFriend: Template with ID "${this.templateId}" not found.`,
      );
      return null;
    }

    await this.loadReminders();

    if (!this.remindersCache || this.remindersCache.length === 0) {
      return null;
    }

    const clone = templateElement.content.cloneNode(true) as DocumentFragment;
    const reminderBox = clone.querySelector(".reminder-box");
    const reminderListElement = clone.querySelector(".reminder-list");

    if (!reminderBox || !reminderListElement) {
      console.warn("AdFriend: Reminder template elements missing.");
      return null;
    }

    if (adRect && adRect.width && reminderBox instanceof HTMLElement) {
      reminderBox.style.width = `${adRect.width}px`;
      reminderBox.style.height =
        adRect.height > 0 ? `${adRect.height}px` : "auto";
    }

    this.remindersCache.forEach((reminder) => {
      const item = document.createElement("div");
      item.className = "reminder-item";
      item.innerHTML = `
                <div class="reminder-text">${reminder.text}</div>
                <div class="reminder-time">${reminder.remindAt}</div>
            `;
      reminderListElement.appendChild(item);
    });

    return reminderBox as HTMLElement;
  }
}
