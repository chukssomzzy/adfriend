// ReminderReplacement.js
window.adFriend = window.adFriend || {};
window.adFriend.ReminderReplacement = class ReminderReplacement extends window.adFriend.ContentReplacement {
  constructor() {
    super('reminder-template');
    this.remindersCache = null;
  }

  async loadReminders() {
    try {
      const { getTodayReminders } = window.adFriend;
      const reminder = await getTodayReminders();
      this.remindersCache = reminder;
    } catch (error) {
      console.error('Error loading reminders:', error);
      this.remindersCache = [];
    }
  }

  async createElement(adRect) {
    const template = document.getElementById(this.template);
    if (!template) return null;

    if (!this.remindersCache) {
      await this.loadReminders();
    }

    const clone = template.content.cloneNode(true);
    const reminderBox = clone.querySelector('.reminder-box');
    const reminderList = clone.querySelector('.reminder-list');

    if (adRect && adRect.width) {
      reminderBox.style.width = `${adRect.width}px`;
    }

    this.remindersCache.forEach(reminder => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      item.innerHTML = `
                <div class="reminder-text">${reminder.text}</div>
                <div class="reminder-time">${reminder.remindAt}</div>
            `;
      reminderList.appendChild(item);
    });

    return reminderBox;
  }
};
