function initializeDB() {
  const request = indexedDB.open("adFriendDB", 2);

  request.onerror = (e) => {
    console.log(`Database error: ${e.target.error?.message}`);
  };

  request.onsuccess = (e) => {
    console.log("DB Connected successfully");
    const db = e.target.result;
    console.log("Object stores:", db.objectStoreNames);
  };

  request.onblocked = () => {
    console.warn("Database upgrade blocked! Close other tabs using this database.");
  };

  request.onupgradeneeded = (e) => {
    console.log("Upgrade needed event triggered!");
    const db = e.target.result;

    if (db.objectStoreNames.contains("reminders")) {
      console.log("Deleting existing object store...");
      db.deleteObjectStore("reminders");
    }

    console.log("Creating new object store...");
    const objStore = db.createObjectStore("reminders", { keyPath: "id", autoIncrement: true });

    objStore.createIndex("text", "text", { unique: false });
    objStore.createIndex("remindAt", "remindAt", { unique: false });
    objStore.createIndex("days", "days", { unique: false });
    objStore.createIndex("isPaused", "isPaused", { unique: false });
    objStore.createIndex("markForDelete", "markForDelete", { unique: false });

    console.log("Object store creation complete!");
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
    this.dbName = "adFriendDB";
    this.version = 2;
    this.storeName = "reminders";
    this.db = null;

    this.order = ["M", "T", "W", "TH", "FR", "SA", "SU"];
    this.dayIndexMap = new Map(this.order.map((day, index) => [index, day]));

    // Don't call initialize in constructor as it's async
    // this.initialize();
  }

  async initialize() {
    if (!this.db) {
      this.db = await this.getDB(this.dbName, this.version);
    }
    return this.db;
  }

  getDB(dbName, version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onerror = (e) => {
        console.error(`Database error: ${e.target.error?.message}`);
        reject(e.target.error);
      };

      request.onblocked = () => {
        console.warn("Database upgrade blocked! Close other tabs using this database.");
        reject(new Error("Database blocked"));
      };

      request.onupgradeneeded = (e) => {
        console.log("Upgrade needed event triggered!");
        const db = e.target.result;

        if (db.objectStoreNames.contains(this.storeName)) {
          console.log("Deleting existing object store...");
          db.deleteObjectStore(this.storeName);
        }

        console.log("Creating new object store...");
        const objStore = db.createObjectStore(this.storeName, {
          keyPath: "id",
          autoIncrement: true
        });

        objStore.createIndex("text", "text", { unique: false });
        objStore.createIndex("remindAt", "remindAt", { unique: false });
        objStore.createIndex("days", "days", { unique: false });
        objStore.createIndex("isPaused", "isPaused", { unique: false });
        objStore.createIndex("markForDelete", "markForDelete", { unique: false });

        console.log("Object store creation complete!");
      };

      request.onsuccess = (e) => {
        console.log("DB Connected successfully");
        const db = e.target.result;
        console.log("Object stores:", db.objectStoreNames);
        resolve(db);
      };
    });
  }

  async getAllReminder() {
    // Make sure database is initialized before trying to use it
    await this.initialize();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(this.storeName, "readonly");
        const objStore = transaction.objectStore(this.storeName);
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
            resolve(filteredReminders);
          }
        };

        transaction.onerror = (e) => {
          reject(`Transaction error: ${e.target.error?.message}`);
        };
      } catch (error) {
        reject(`Failed to start transaction: ${error.message}`);
      }
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
