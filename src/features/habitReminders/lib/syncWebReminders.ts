import type { Habit } from "@/entities/habit";
import { collectReminderJobs } from "./collectReminderJobs";
import { HABIT_REMINDER_TAG_PREFIX } from "./notificationIds";

const PERIODIC_SYNC_TAG = "habit-reminders";
const IDB_NAME = "habit-reminders";
const IDB_VERSION = 2;
const IDB_STORE = "schedule";
const FIRED_STORE = "fired";
const IDB_KEY = "pending";

type StoredJob = {
  tag: string;
  title: string;
  body: string;
  url: string;
  at: number;
};

function openScheduleDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
      if (!db.objectStoreNames.contains(FIRED_STORE)) {
        db.createObjectStore(FIRED_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

async function writeSchedule(jobs: StoredJob[]): Promise<void> {
  const db = await openScheduleDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(jobs, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB write failed"));
  });
  db.close();
}

async function registerPeriodicSync(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (!reg || !("periodicSync" in reg)) return;
    const status = await navigator.permissions.query({
      name: "periodic-background-sync" as PermissionName,
    });
    if (status.state !== "granted") return;
    // Браузер сам ограничит частоту; просим почаще для catch-up
    await (
      reg as ServiceWorkerRegistration & {
        periodicSync: {
          register: (tag: string, opts: { minInterval: number }) => Promise<void>;
        };
      }
    ).periodicSync.register(PERIODIC_SYNC_TAG, {
      minInterval: 60 * 60 * 1000,
    });
  } catch {
    // unsupported / not installed PWA
  }
}

/**
 * PWA: пишет расписание в IDB + SW (TimestampTrigger, если есть) и
 * регистрирует periodicsync как best-effort фон без серверного push.
 */
export async function syncWebReminders(habits: Habit[]): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const jobs = collectReminderJobs(habits).map((j) => ({
    tag: j.tag,
    title: j.title,
    body: j.body,
    url: j.url,
    at: j.at.getTime(),
  }));

  try {
    await writeSchedule(jobs);
  } catch {
    // ignore storage errors
  }

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.active) {
      reg.active.postMessage({
        type: "SCHEDULE_REMINDERS",
        tagPrefix: HABIT_REMINDER_TAG_PREFIX,
        periodicTag: PERIODIC_SYNC_TAG,
        items: jobs,
      });
    }
  } catch {
    // ignore
  }

  if (jobs.length) {
    await registerPeriodicSync();
  }
}
