import type { AdRect } from "@/shared/types";

/**
 * Abstract base class for content replacement strategies.
 * Subclasses must implement the `createElement` method.
 */
export abstract class ContentReplacement {
  protected templateId: string;

  /**
   * Initializes a new instance of the ContentReplacement class.
   * @param templateId - The ID of the HTML template to use for creating the replacement element.
   */
  constructor(templateId: string) {
    this.templateId = templateId;
  }

  /**
   * Creates a DOM element to replace an ad.
   * This method must be implemented by subclasses.
   * @param adRect - The bounding rectangle of the ad element being replaced.
   * @returns A promise that resolves to the HTMLElement to be used as a replacement, or null if creation fails.
   */
  public abstract createElement(adRect?: AdRect): Promise<HTMLElement | null>;
}
