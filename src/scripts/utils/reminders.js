window.adFriend = window.adFriend || {}

window.adFriend.getTodayReminders = function getTodayReminders() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'getTodayReminders' },
      response => {
        if (response.success) {
          resolve(response.reminders);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}
