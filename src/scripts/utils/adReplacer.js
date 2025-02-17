window.adFriend = window.adFriend || {};
window.adFriend.AdReplacer = class AdReplacer {
  CONFIG = {}
  constructor() {
    const { CONFIG, ContentReplacementManager } = window.adFriend;
    this.processedAds = new WeakSet();
    this.observer = null;
    this.adStyleCache = new Map();
    this.contentManager = new ContentReplacementManager();
    this.CONFIG = CONFIG

    this.adSelectors = Object.values(CONFIG.adSelectors)
      .flat()
      .join(',');
  }

  async init() {
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    await this.injectTemplates();
    this.removeAdScripts();
    this.interceptAdSense();
    await this.replaceExistingAds();
    this.handleIframeAds();
    this.startObserver();
    console.log('AdReplacer started');
  }


  removeAdScripts() {
    const adScriptDomains = [
      'pagead2.googlesyndication.com',
      'securepubads.g.doubleclick.net',
      'amazon-adsystem.com',
      'ads.pubmatic.com',
      'platform.twitter.com',
      'connect.facebook.net',
      'cdn.taboola.com',
      'ib.adnxs.com',
      'ads.yahoo.com',
      'medianet-ads.com'
    ];

    const scriptSelector = adScriptDomains
      .map(domain => `script[src*="${domain}"]`)
      .join(',');

    const adScripts = document.querySelectorAll(scriptSelector);
    adScripts.forEach(script => script.remove());
  }

  handleIframeAds() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const iframeAds = iframeDoc.querySelectorAll(this.adSelectors);
          iframeAds.forEach(ad => this.replaceAd(ad));
        }
      } catch (e) {
        // Cross-origin iframe, can't access content
        if (this.isLikelyAdIframe(iframe)) {
          this.replaceAd(iframe);
        }
      }
    });
  }

  isLikelyAdIframe(iframe) {
    const src = iframe.src.toLowerCase();
    const adDomains = [
      'doubleclick.net',
      'amazon-adsystem.com',
      'facebook.com',
      'taboola.com',
      'outbrain.com',
      'medianet.com'
    ];

    return adDomains.some(domain => src.includes(domain)) ||
      iframe.id.toLowerCase().includes('ad') ||
      iframe.className.toLowerCase().includes('ad');
  }

  interceptAdSense() {
    window.adsbygoogle = window.adsbygoogle || [];
    const originalPush = Array.prototype.push;

    window.adsbygoogle.push = (...args) => {
      args.forEach(ad => {
        if (ad && typeof ad === 'object') {
          if (ad.nodeType === Node.ELEMENT_NODE) {
            this.captureAdStyle(ad);
            this.replaceAd(ad);
          } else if (ad.google_ad_client || ad.google_ad_slot) {
            const nearestContainer = document.querySelector('ins.adsbygoogle:not([data-ad-status="processed"])');
            if (nearestContainer) {
              this.replaceAd(nearestContainer);
            }
          }
        }
      });
      return originalPush.apply(window.adsbygoogle, args);
    };

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName) {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name, value) {
          if (value && typeof value === 'string' && value.includes('pagead2.googlesyndication.com')) {
            return;
          }
          return originalSetAttribute(name, value);
        };
      }
      return element;
    };
  }

  captureAdStyle(adElement) {
    if (!adElement || this.adStyleCache.has(adElement)) return;

    const computedStyle = window.getComputedStyle(adElement);
    const rect = adElement.getBoundingClientRect();
    const dimensions = this.findClosestAdSize(rect.width, rect.height);

    this.adStyleCache.set(adElement, {
      width: dimensions.width,
      height: dimensions.height,
      display: computedStyle.display,
      position: computedStyle.position,
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      float: computedStyle.float,
      alignSelf: computedStyle.alignSelf,
      textAlign: computedStyle.textAlign
    });
  }

  findClosestAdSize(width, height) {
    if (!width || !height) {
      return this.CONFIG.adSizes.display[0];
    }

    return this.CONFIG.adSizes.display.reduce((closest, size) => {
      const currentDiff = Math.abs(size.width - width) + Math.abs(size.height - height);
      const closestDiff = Math.abs(closest.width - width) + Math.abs(closest.height - height);
      return currentDiff < closestDiff ? size : closest;
    });
  }

  async injectTemplates() {
    const templatesContainer = document.createElement('div');
    templatesContainer.style.display = 'none';
    templatesContainer.innerHTML = `
            <template id="quote-template">
                <div class="motivation-box">
                    <div class="quote-content">
                        <div class="quote-text"></div>
                        <div class="quote-author"></div>
                    </div>
                </div>
            </template>
            <template id="reminder-template">
                <div class="reminder-box">
                    <div class="reminder-header">
                        <span class="reminder-title">Daily Reminders</span>
                        <span class="reminder-timestamp">${this.CONFIG.timestamp}</span>
                    </div>
                    <div class="reminder-container">
                        <div class="reminder-list"></div>
                    </div>
                </div>
            </template>
        `;
    document.body.appendChild(templatesContainer);
  }



  async replaceAd(adElement) {
    if (!adElement || this.processedAds.has(adElement)) return;
    this.processedAds.add(adElement);

    try {
      const rect = adElement.getBoundingClientRect();
      const replacementElement = await this.contentManager.getNextReplacement(rect);

      if (replacementElement && adElement.parentNode) {
        adElement.style.display = 'none';
        adElement.parentNode.insertBefore(replacementElement, adElement.nextSibling);
      }
    } catch (error) {
      console.error('Error replacing ad:', error);
    }
  }

  async replaceExistingAds() {
    const adElements = document.querySelectorAll(this.adSelectors);
    for (const adElement of adElements) {
      await this.replaceAd(adElement);
    }
  }

  removeAdScripts() {
    const adScripts = document.querySelectorAll('script[src*="pagead2.googlesyndication.com"]');
    adScripts.forEach(script => script.remove());
  }

  startObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches(this.adSelectors)) {
              this.replaceAd(node);
            }
            const ads = node.querySelectorAll(this.adSelectors);
            ads.forEach(ad => this.replaceAd(ad));
          }
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}
