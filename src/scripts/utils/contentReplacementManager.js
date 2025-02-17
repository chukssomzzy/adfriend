window.adFriend = window.adFriend || {};
window.adFriend.ContentReplacementManager = class ContentReplacementManager {
  constructor() {
    const { QuoteReplacement, ReminderReplacement } = window.adFriend;
    this.replacements = [
      new QuoteReplacement(),
      new ReminderReplacement()
    ];
    this.currentIndex = 0;
  }

  async getNextReplacement(adRect) {
    const replacement = this.replacements[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.replacements.length;
    return await replacement.createElement(adRect);
  }
}
