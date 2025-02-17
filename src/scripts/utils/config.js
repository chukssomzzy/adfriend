window.adFriend = window.adFriend || {};
window.adFriend.CONFIG = {
  timestamp: new Date().toISOString(),
  debug: true,
  adSelectors: {
    // Google AdSense
    adsense: [
      'ins.adsbygoogle[data-ad-client]',
      'ins.adsbygoogle[data-ad-slot]',
      'ins.adsbygoogle',
      'div[id^="google_ads_iframe"]',
      'iframe[id^="google_ads_iframe"]',
      '#google_ads_frame',
      '.adsbygoogle',
      '.google-ad-container',
      '.adsense-container',
      '.adsbygoogle-responsive'
    ],
    // Google Ad Manager / DoubleClick
    gam: [
      'div[id^="div-gpt-ad"]',
      'div[id^="gpt-ad"]',
      'div[id^="google_ads_iframe"]',
      '.dfp-ad',
      '.gpt-ad'
    ],
    // Meta (Facebook) Ads
    meta: [
      'div[class*="fb_ad"]',
      'div[id^="fb-"]',
      '.fb-ad',
      'iframe[src*="facebook.com/plugins"]',
      'div[data-ad*="facebook"]'
    ],
    // Amazon Ads
    amazon: [
      'div[id^="amzn_assoc"]',
      'iframe[src*="amazon-adsystem.com"]',
      '.amzn_ads',
      'div[class*="amazon-ad"]'
    ],
    // Taboola
    taboola: [
      '#taboola',
      '[id^="taboola"]',
      'div[id^="tbl-"]',
      '.trc_rbox_container',
      '.trc_related_container',
      'div[data-placement^="Below Article Thumbnails"]'
    ],
    // Outbrain
    outbrain: [
      'div[class*="OUTBRAIN"]',
      'div[id^="outbrain_widget"]',
      '.ob-widget',
      'div[data-widget-id^="AR_"]'
    ],
    // Media.net
    medianet: [
      'div[id^="mdnativex"]',
      'div[id^="mdn-"]',
      'div[id^="_mN"]',
      '.medianet-ad'
    ],
    // Generic Ad Selectors
    generic: [
      // Common ad container classes
      '.ad',
      '.ads',
      '.advertisement',
      '.advertising',
      '.ad-container',
      '.ad-wrapper',
      '.ad-unit',
      '.ad-zone',
      '.ad-space',
      // Specific ad sizes
      '.rectangle-ad',
      '.leaderboard-ad',
      '.skyscraper-ad',
      '.banner-ad',
      // Common ad placements
      '.sidebar-ad',
      '.header-ad',
      '.footer-ad',
      '.content-ad',
      // IFrames commonly used for ads
      'iframe[id*="ad-"]',
      'iframe[id*="-ad"]',
      'iframe[class*="ad-"]',
      'iframe[class*="-ad"]',
      // Common ad network classes
      '[class*="-ad-placement"]',
      '[class*="ad-placement"]',
      '[id*="ad-placement"]',
      // Ad containers with sponsored content
      '.sponsored-content',
      '.sponsored-post',
      '.sponsored',
      // Native ad containers
      '.native-ad',
      '.promoted-content',
      '.recommended-content'
    ]
  },
  adSizes: {
    display: [
      {width: 300, height: 250},  // Medium Rectangle
      {width: 336, height: 280},  // Large Rectangle
      {width: 728, height: 90},   // Leaderboard
      {width: 300, height: 600},  // Large Skyscraper
      {width: 320, height: 100},  // Large Mobile Banner
      {width: 468, height: 60},   // Banner
      {width: 234, height: 60},   // Half Banner
      {width: 120, height: 600},  // Skyscraper
      {width: 160, height: 600},  // Wide Skyscraper
      {width: 970, height: 90},   // Large Leaderboard
      {width: 970, height: 250},  // Billboard
      {width: 250, height: 250},  // Square
      {width: 200, height: 200},  // Small Square
      {width: 320, height: 50},   // Mobile Leaderboard
      {width: 300, height: 50}    // Mobile Banner
    ]
  }
};
