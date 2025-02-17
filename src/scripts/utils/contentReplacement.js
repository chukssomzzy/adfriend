window.adFriend = window.adFriend || {};
window.adFriend.ContentReplacement = class ContentReplacement {
  constructor(template) {
    this.template = template;
  }

  createElement(adRect) {
    throw new Error('Must be implemented by subclass');
  }
};
