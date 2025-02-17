window.adFriend = window.adFriend || {};
window.adFriend.QuoteReplacement = class QuoteReplacement extends window.adFriend.ContentReplacement {
  constructor() {
    super('quote-template');
    this.quotesCache = window.adFriend.quotes || [];
  }

  getRandomQuote() {
    if (!this.quotesCache.length) return { text: "No quotes available", author: "Unknown" };
    return this.quotesCache[Math.floor(Math.random() * this.quotesCache.length)];
  }

  createElement(adRect) {
    const template = document.getElementById(this.template);
    if (!template) return null;

    const quote = this.getRandomQuote();
    const clone = template.content.cloneNode(true);
    const quoteBox = clone.querySelector('.motivation-box');
    const quoteText = clone.querySelector('.quote-text');
    const quoteAuthor = clone.querySelector('.quote-author');

    quoteText.textContent = quote.text;
    quoteAuthor.textContent = `- ${quote.author}`;

    if (adRect && adRect.width) {
      quoteBox.style.width = `${adRect.width}px`;
    }

    return quoteBox;
  }
};
