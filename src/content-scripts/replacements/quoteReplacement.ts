import { ContentReplacement } from "@/content-scripts/contentReplacement";
import type { AdRect, Quote } from "@/shared/types";
import motivationalQuotes from "@/shared/quotes";

/**
 * Replaces ad elements with motivational quotes.
 */
export class QuoteReplacement extends ContentReplacement {
  private quotesCache: Quote[];

  /**
   * Initializes a new instance of the QuoteReplacement class.
   */
  constructor() {
    super("adfriend-quote-template");
    this.quotesCache = motivationalQuotes;
  }

  /**
   * Selects a random quote from the cache.
   * @returns A random Quote object.
   */
  private getRandomQuote(): Quote {
    if (!this.quotesCache || this.quotesCache.length === 0) {
      return {
        text: "Stay positive, work hard, make it happen.",
        author: "AdFriend",
      };
    }
    const randomIndex = Math.floor(Math.random() * this.quotesCache.length);
    return this.quotesCache[randomIndex];
  }

  /**
   * Creates a quote box element.
   * @param adRect - The bounding rectangle of the ad being replaced.
   * @returns A promise that resolves to the HTMLElement for the quote box, or null.
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

    const quote = this.getRandomQuote();
    const clone = templateElement.content.cloneNode(true) as DocumentFragment;

    const quoteBox = clone.querySelector(".motivation-box");
    const quoteTextElement = clone.querySelector(".quote-text");
    const quoteAuthorElement = clone.querySelector(".quote-author");

    if (!quoteBox || !quoteTextElement || !quoteAuthorElement) {
      console.warn("AdFriend: Quote template elements missing.");
      return null;
    }

    quoteTextElement.textContent = quote.text;
    quoteAuthorElement.textContent = `- ${quote.author}`;

    if (adRect && adRect.width && quoteBox instanceof HTMLElement) {
      quoteBox.style.width = `${adRect.width}px`;
      quoteBox.style.height = adRect.height > 0 ? `${adRect.height}px` : "auto";
      quoteBox.style.display = "flex";
    }
    return quoteBox as HTMLElement;
  }
}
