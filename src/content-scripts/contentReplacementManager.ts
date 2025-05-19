// src/content-scripts/contentReplacementManager.ts
import { QuoteReplacement } from "@/content-scripts/replacements/quoteReplacement";
import { ReminderReplacement } from "@/content-scripts/replacements/reminderReplacement";
import type { ContentReplacement } from "@/content-scripts/contentReplacement";
import type { AdRect } from "@/shared/types";

/**
 * Manages the selection and creation of content replacements for ads.
 * Cycles through available replacement types.
 */
export class ContentReplacementManager {
  private replacements: ContentReplacement[];
  private currentIndex: number;

  /**
   * Initializes a new instance of the ContentReplacementManager.
   * Instantiates the available replacement strategies.
   */
  constructor() {
    this.replacements = [
      new QuoteReplacement(),
      new ReminderReplacement(),
      // Add more replacement types here if needed
    ];
    this.currentIndex = 0;
  }

  /**
   * Gets the next available content replacement element.
   * It cycles through the registered replacement types. If a type
   * cannot produce an element (e.g., no reminders for ReminderReplacement),
   * it tries the next one.
   * @param adRect - The bounding rectangle of the ad element to be replaced.
   * @returns A promise that resolves to an HTMLElement to use as a replacement, or null if no suitable replacement can be generated.
   */
  public async getNextReplacement(
    adRect?: AdRect,
  ): Promise<HTMLElement | null> {
    if (this.replacements.length === 0) {
      return null;
    }

    let attempts = 0;

    while (attempts < this.replacements.length) {
      const replacementStrategy = this.replacements[this.currentIndex];
      const element = await replacementStrategy.createElement(adRect);

      this.currentIndex = (this.currentIndex + 1) % this.replacements.length;

      if (element) {
        return element;
      }
      attempts++;
    }

    // If all strategies returned null (e.g. no reminders and quote failed for some reason)
    console.warn("AdFriend: No replacement content could be generated.");
    return null;
  }
}
