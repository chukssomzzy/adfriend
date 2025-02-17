#!/usr/bin/env node
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "adFriendDB"
const STORE_NAME = "reminders"

export interface Reminder {
  text: string;
  remindAt: string; 
  days: Set<string>;
  createdAt?: Date;
  repeat?: boolean;
  isPaused?: boolean;
  id?: number;
}

export const getDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 2);
}

export const saveReminders = async (reminders: Reminder) => {
  const db = await getDB();
  await db.add(STORE_NAME, reminders);
}

export const getReminders = async (): Promise<Array<Reminder>> => {
    const db = await getDB();

    return db.getAll(STORE_NAME);
}

export const deleteReminder = async (reminderId: number) => {
    const db = await getDB(); 

    return db.delete(STORE_NAME, reminderId);
}


export const pauseReminder = async (reminderId: number) => {
    const db = await getDB();

    console.log(reminderId);
    const reminder: Reminder = await db.get(STORE_NAME, reminderId); 

    reminder.isPaused = reminder.isPaused ? false : true; 

    await db.put(STORE_NAME, reminder); 
}
