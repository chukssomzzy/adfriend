import { CONFIG } from "@/shared/config";
import type { AdSize, AdRect } from "@/shared/types";
import { ContentReplacementManager } from "@/content-scripts/contentReplacementManager";

/**
 * Handles the detection and replacement of ad elements on a webpage.
 */
export class AdReplacer {
  private processedAds: WeakSet<Element>;
  private observer: MutationObserver | null;
  private contentManager: ContentReplacementManager;
  private readonly adSelectors: string;
  private readonly adScriptDomains: string[];

  /**
   * Initializes a new instance of the AdReplacer class.
   */
  constructor() {
    this.processedAds = new WeakSet();
    this.observer = null;
    this.contentManager = new ContentReplacementManager();

    this.adSelectors = Object.values(CONFIG.adSelectors).flat().join(",");
    this.adScriptDomains = [
      "pagead2.googlesyndication.com",
      "googlesyndication.com",
      "doubleclick.net",
      "googleads.g.doubleclick.net",
      "securepubads.g.doubleclick.net",
      "amazon-adsystem.com",
      "criteo.net",
      "adsrvr.org",
      "rubiconproject.com",
      "openx.net",
      "pubmatic.com",
      "adnxs.com",
      "taboola.com",
      "outbrain.com",
      "spotxchange.com",
      "advertising.com",
      "yieldmo.com",
      "smartadserver.com",
      "revcontent.com",
      "mgid.com",
      "adthrive.com",
      "mediavine.com",
    ];
  }

  /**
   * Initializes the ad replacement process.
   * Waits for DOM content to load, injects HTML templates,
   * removes ad scripts, intercepts AdSense, replaces existing ads,
   * handles iframe ads, and starts observing DOM mutations.
   */
  public async init(): Promise<void> {
    if (document.readyState === "loading") {
      await new Promise((resolve) =>
        document.addEventListener("DOMContentLoaded", resolve),
      );
    }

    this.injectTemplates();
    this.removeAdScripts();
    this.interceptAdTech();
    await this.replaceExistingAds();
    this.handleIframeAds();
    this.startObserver();
    console.log("AdFriend: AdReplacer initialized.");
  }

  /**
   * Injects HTML templates required for replacements into the document body.
   */
  private injectTemplates(): void {
    if (document.getElementById("adfriend-templates-container")) {
      return;
    }
    const templatesContainer = document.createElement("div");
    templatesContainer.id = "adfriend-templates-container";
    templatesContainer.style.display = "none";
    templatesContainer.innerHTML = `
            <template id="adfriend-quote-template">
                <div class="motivation-box">
                    <div class="quote-content">
                        <p class="quote-text"></p>
                        <p class="quote-author"></p>
                    </div>
                </div>
            </template>
            <template id="adfriend-reminder-template">
                <div class="reminder-box">
                    <div class="reminder-header">
                        <span class="reminder-title">Daily Reminders</span>
                        <span class="reminder-timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div class="reminder-list-container">
                        <div class="reminder-list"></div>
                    </div>
                </div>
            </template>
        `;
    document.body.appendChild(templatesContainer);
  }

  /**
   * Removes script tags associated with known ad networks.
   */
  private removeAdScripts(): void {
    const scriptSelector = this.adScriptDomains
      .map((domain) => `script[src*="${domain}"]`)
      .join(",");
    document.querySelectorAll(scriptSelector).forEach((script) => {
      script.remove();
      if (CONFIG.debug)
        console.log("AdFriend: Removed ad script:", script.getAttribute("src"));
    });
  }

  /**
   * Intercepts Google AdSense and other ad tech initializations.
   */
  private interceptAdTech(): void {
    Object.defineProperty(window, "adsbygoogle", {
      value: {
        push: (ad: unknown) => {
          if (CONFIG.debug)
            console.log("AdFriend: adsbygoogle.push() intercepted", ad);
          const insElements = document.querySelectorAll(
            'ins.adsbygoogle:not([data-adfriend-processed="true"])',
          );
          if (insElements.length > 0) {
            this.replaceAd(insElements[insElements.length - 1]);
          }
          return 0;
        },
      },
      writable: false,
      configurable: true,
    });

    const adFunctionsToBlock = ["googletag", "OxP", "AdButler"];
    adFunctionsToBlock.forEach((funcName) => {
      try {
        Object.defineProperty(window, funcName, {
          get: () => {
            if (CONFIG.debug)
              console.log(
                `AdFriend: Access to window.${funcName} intercepted.`,
              );
            return new Proxy(
              {},
              {
                get: (_target, prop) => {
                  if (prop === "cmd") return [];
                  if (typeof prop === "symbol") return undefined;
                  return () => {
                    /* no-op */
                  };
                },
                set: () => true,
              },
            );
          },
          set: () => {
            if (CONFIG.debug)
              console.log(
                `AdFriend: Attempt to set window.${funcName} blocked.`,
              );
          },
          configurable: true,
        });
      } catch (e) {
        console.log(e);
      }
    });
  }

  /**
   * Finds the closest standard ad size for given dimensions.
   * @param width - The width of the ad element.
   * @param height - The height of the ad element.
   * @returns The closest AdSize object.
   */
  private findClosestAdSize(width: number, height: number): AdSize {
    if (!width || !height || width <= 0 || height <= 0) {
      return (
        CONFIG.adSizes.display.find(
          (s) => s.width === 300 && s.height === 250,
        ) || CONFIG.adSizes.display[0]
      );
    }
    return CONFIG.adSizes.display.reduce((closest, current) => {
      const diffCurrent =
        Math.abs(current.width - width) + Math.abs(current.height - height);
      const diffClosest =
        Math.abs(closest.width - width) + Math.abs(closest.height - height);
      return diffCurrent < diffClosest ? current : closest;
    });
  }

  /**
   * Replaces an ad element with generated content.
   * @param adElement - The ad element to replace.
   */
  private async replaceAd(adElement: Element): Promise<void> {
    if (
      !adElement ||
      this.processedAds.has(adElement) ||
      adElement.getAttribute("data-adfriend-processed") === "true"
    ) {
      return;
    }
    this.processedAds.add(adElement);
    adElement.setAttribute("data-adfriend-processed", "true");

    if (adElement instanceof HTMLElement) {
      adElement.style.setProperty("display", "none", "important");
      adElement.style.setProperty("visibility", "hidden", "important");
      adElement.style.width = "0px";
      adElement.style.height = "0px";
      adElement.style.overflow = "hidden";
    }

    try {
      const rect = adElement.getBoundingClientRect();
      const adRect: AdRect = {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      };

      const normalizedSize = this.findClosestAdSize(
        adRect.width,
        adRect.height,
      );
      const replacementRect: AdRect = {
        ...adRect,
        width: normalizedSize.width,
        height: normalizedSize.height,
      };

      const replacementElement =
        await this.contentManager.getNextReplacement(replacementRect);

      if (replacementElement && adElement.parentNode) {
        if (replacementElement instanceof HTMLElement) {
          replacementElement.style.width = `${replacementRect.width}px`;
          replacementElement.style.height = `${replacementRect.height}px`;
          replacementElement.style.display = "inline-block";
          replacementElement.style.visibility = "visible";
          replacementElement.classList.add(
            `ad-size-${replacementRect.width}x${replacementRect.height}`,
          );
        }

        adElement.parentNode.insertBefore(
          replacementElement,
          adElement.nextSibling,
        );
        if (CONFIG.debug)
          console.log(
            "AdFriend: Replaced ad:",
            adElement,
            "with",
            replacementElement,
          );
      } else {
        if (CONFIG.debug && !replacementElement)
          console.log("AdFriend: No replacement generated for:", adElement);
      }
    } catch (error: unknown) {
      console.error("AdFriend: Error replacing ad:", error, adElement);
    }
  }

  /**
   * Replaces all existing ad elements on the page.
   */
  private async replaceExistingAds(): Promise<void> {
    const adElements = document.querySelectorAll(this.adSelectors);
    for (const adElement of adElements) {
      if (!adElement.getAttribute("data-adfriend-processed")) {
        await this.replaceAd(adElement);
      }
    }
  }

  /**
   * Handles ads within iframes.
   * Replaces ads in accessible iframes or the iframe itself if it's likely an ad.
   */
  private handleIframeAds(): void {
    document.querySelectorAll("iframe").forEach((iframe) => {
      if (
        this.processedAds.has(iframe) ||
        iframe.getAttribute("data-adfriend-processed") === "true"
      ) {
        return;
      }
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const adElements = iframeDoc.querySelectorAll(this.adSelectors);
          adElements.forEach((ad) => {
            if (CONFIG.debug)
              console.log(
                "AdFriend: Found ad in accessible iframe, needs specific handling strategy.",
                ad,
              );
          });
          if (adElements.length > 0 && this.isLikelyAdIframe(iframe)) {
            this.replaceAd(iframe);
          }
        }
      } catch (e) {
        if (this.isLikelyAdIframe(iframe)) {
          this.replaceAd(iframe);
        }
      }
    });
  }

  /**
   * Checks if an iframe is likely an ad based on its src, id, or class.
   * @param iframe - The iframe element to check.
   * @returns True if the iframe is likely an ad, false otherwise.
   */
  private isLikelyAdIframe(iframe: HTMLIFrameElement): boolean {
    const src = (
      iframe.src ||
      iframe.getAttribute("srcdoc") ||
      ""
    ).toLowerCase();
    const adKeywords = [
      "ad",
      "ads",
      "advert",
      "banner",
      "iframe",
      "doubleclick",
      "googlesyndication",
      "amazon-adsystem",
      "criteo",
      "taboola",
      "outbrain",
      "rubicon",
      "pubmatic",
      "adnxs",
    ];

    const idAndClass = `${iframe.id.toLowerCase()} ${iframe.className.toLowerCase()}`;

    if (src && this.adScriptDomains.some((domain) => src.includes(domain)))
      return true;
    if (src && adKeywords.some((keyword) => src.includes(keyword))) return true;

    if (adKeywords.some((keyword) => idAndClass.includes(keyword))) return true;

    const width = parseInt(iframe.width, 10) || iframe.clientWidth;
    const height = parseInt(iframe.height, 10) || iframe.clientHeight;
    if (width > 0 && height > 0) {
      if (
        CONFIG.adSizes.display.some(
          (size) => size.width === width && size.height === height,
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Starts observing the DOM for mutations to detect and replace dynamically added ads.
   */
  private startObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const elementNode = node as Element;
            if (elementNode.matches && elementNode.matches(this.adSelectors)) {
              this.replaceAd(elementNode);
            }
            elementNode
              .querySelectorAll(this.adSelectors)
              .forEach((ad) => this.replaceAd(ad));
            if (elementNode.tagName === "IFRAME") {
              this.handleIframeAds();
            }
          }
        });
        if (
          mutation.type === "attributes" &&
          mutation.target.nodeType === Node.ELEMENT_NODE
        ) {
          const targetElement = mutation.target as Element;
          if (
            targetElement.matches &&
            targetElement.matches(this.adSelectors)
          ) {
            this.replaceAd(targetElement);
          }
        }
      }
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "id", "src"],
    });
  }
}
