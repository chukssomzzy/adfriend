#!/usr/bin/env node


chrome.runtime.onInstalled.addListener((details) => {
  db = indexedDB.open("AdFriendDB", 1);

  db.onerror = (e) => {
    console.log(`Database error: ${e.target.error?.message}`);
  };

  db.onsuccess = (e) => {
    console.log("DB Created successfully");
  }


  db.onupgradeneeded = (e) => {
    db = e.target.result;

    if (db.objectStoreNames.contains("reminders")) {
      db.deleteObjectStore("reminders");
    }

    objStore = db.createObjectStore("reminders", { keyPath: "id", autoIncrement: true });

    objStore.createIndex("text", "text", { unique: false });
    objStore.createIndex("remindAt", "remindAt", { unique: false });
    objStore.createIndex("days", "days", { unique: false });
    objStore.createIndex("isPaused", "isPaused", { unique: false });
    objStore.createIndex("markForDelete", "markForDelete", { unique: false });

    objStore.transaction.oncomplete = (e) => {
        console.log("Objectstore created successfully");
    }
  }
})
