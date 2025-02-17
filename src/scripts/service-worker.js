// Initialize IndexedDB
function initializeDB() {
  const request = indexedDB.open("AdFriendDB", 1);

  request.onerror = (e) => {
    console.log(`Database error: ${e.target.error?.message}`);
  };

  request.onsuccess = (e) => {
    console.log("DB Connected successfully");
  };

  request.onupgradeneeded = (e) => {
    const db = e.target.result;

    if (db.objectStoreNames.contains("reminders")) {
      db.deleteObjectStore("reminders");
    }

    const objStore = db.createObjectStore("reminders", { keyPath: "id", autoIncrement: true });

    objStore.createIndex("text", "text", { unique: false });
    objStore.createIndex("remindAt", "remindAt", { unique: false });
    objStore.createIndex("days", "days", { unique: false });
    objStore.createIndex("isPaused", "isPaused", { unique: false });
    objStore.createIndex("markForDelete", "markForDelete", { unique: false });
  };
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  initializeDB();

  // Register content scripts
  chrome.scripting.registerContentScripts([{
    id: "adfriend-script",
    js: [
      "scripts/utils/config.js",
      "scripts/utils/quotes.js",
      "scripts/utils/reminders.js",
      "scripts/utils/contentReplacement.js",
      "scripts/replacements/quoteReplacement.js",
      "scripts/replacements/reminderReplacement.js",
      "scripts/utils/contentReplacementManager.js",
      "scripts/utils/adReplacer.js",
      "scripts/content.js",
    ],
    css: ["scripts/style.css"],
    matches: ["https://*/*", "http://*/*"],
    runAt: "document_start",
    //world: "MAIN"
  }])
    .then(() => console.log("Content script registration complete"))
    .catch((err) => console.warn("Content script registration error:", err));
});

// Log registered scripts for debugging
chrome.scripting.getRegisteredContentScripts()
  .then(scripts => console.log("Registered content scripts:", scripts))
  .catch(err => console.error("Error getting registered scripts:", err));


class Reminders {
  constructor() {
    this.dbName = "AdFriendDB";
    this.version = 1;
    this.storeName = "reminders";
    this.db = null;

    this.order = ["M", "T", "W", "TH", "FR", "SA", "SU"];
    this.dayIndexMap = new Map(this.order.map((day, index) => [index, day]));

    this.initialize();
  }

  async initialize() {
    if (!this.db) {
      this.db = await this.getDB(this.dbName, this.version);
    }
  }

  getDB(dbName, version) {
    return new Promise((res, rej) => {
      const request = indexedDB.open(dbName, version);
      request.onerror = (e) => rej(`Database error: ${e.target.error?.message}`);
      request.onsuccess = (e) => res(e.target.result);
    });
  }

  async getAllReminder() {
    await this.initialize();

    return new Promise((res, rej) => {
      const objStore = this.db.transaction(this.storeName).objectStore(this.storeName);
      const reminders = [];

      objStore.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        const day = new Date().getUTCDay();

        if (cursor) {
          const reminder = cursor.value;

          if (!reminder.isPaused) {
            const isToday = reminder.days.has(this.dayIndexMap.get(day));
            if (!reminder.days.size || isToday) {
              reminders.push(reminder);
            }
          }
          cursor.continue();
        } else {
          const currentTime = new Date();
          const filteredReminders = reminders.filter(reminder => {
            const [remindHour, remindMinute] = reminder.remindAt.split(":");
            const remindTime = new Date();
            remindTime.setHours(remindHour, remindMinute, 0, 0);

            return remindTime >= currentTime;
          });
          filteredReminders.sort((a, b) => a.createdAt - b.createdAt);
          res(filteredReminders);
        }
      };

      objStore.onerror = (e) => {
        rej(`Object read Error: ${e.target.error?.message}`);
      };
    });
  }
}

const reminders = new Reminders();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTodayReminders') {
    reminders.getAllReminder()
      .then(todayReminders => {
        sendResponse({ success: true, reminders: todayReminders });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.toString() });
      });
    return true;
  }
});
