import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

registerRoute(
  ({ request }) =>
    ["script", "style", "image", "font"].includes(request.destination),
  new CacheFirst({
    cacheName: "static-assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin === "https://habit-backend.onrender.com",
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

const IDB_NAME = "habit-reminders";
const IDB_VERSION = 2;
const IDB_STORE = "schedule";
const IDB_KEY = "pending";
const FIRED_STORE = "fired";
const DEFAULT_TAG_PREFIX = "habit-reminder:";
const DEFAULT_PERIODIC_TAG = "habit-reminders";
const CATCHUP_WINDOW_MS = 60 * 60 * 1000;

function openDb() {
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
    req.onerror = () => reject(req.error || new Error("IDB open failed"));
  });
}

async function readSchedule() {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error("IDB read failed"));
    });
  } finally {
    db.close();
  }
}

async function wasFired(tag) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(FIRED_STORE, "readonly");
      const req = tx.objectStore(FIRED_STORE).get(tag);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => reject(req.error || new Error("IDB fired read failed"));
    });
  } finally {
    db.close();
  }
}

async function markFired(tag) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(FIRED_STORE, "readwrite");
      tx.objectStore(FIRED_STORE).put(Date.now(), tag);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IDB fired write failed"));
    });
  } finally {
    db.close();
  }
}

function supportsTimestampTrigger() {
  return typeof TimestampTrigger !== "undefined";
}

async function clearTriggeredByPrefix(tagPrefix) {
  try {
    const existing = await self.registration.getNotifications({
      includeTriggered: true,
    });
    await Promise.all(
      existing
        .filter((n) => (n.tag || "").startsWith(tagPrefix))
        .map((n) => n.close()),
    );
  } catch {
    try {
      const existing = await self.registration.getNotifications();
      await Promise.all(
        existing
          .filter((n) => (n.tag || "").startsWith(tagPrefix))
          .map((n) => n.close()),
      );
    } catch {
      // ignore
    }
  }
}

async function showReminderNotification(item, { withTrigger = false } = {}) {
  const options = {
    body: item.body,
    icon: "/logo.svg",
    badge: "/logo.svg",
    data: item.url || "/",
    tag: item.tag || "habit-reminder",
    renotify: true,
  };

  if (withTrigger && supportsTimestampTrigger() && item.at) {
    options.showTrigger = new TimestampTrigger(item.at);
  }

  await self.registration.showNotification(
    item.title || "habit",
    options,
  );
}

async function scheduleReminderItems(items, tagPrefix) {
  await clearTriggeredByPrefix(tagPrefix);

  if (!supportsTimestampTrigger()) {
    return;
  }

  for (const item of items) {
    if (!item?.at || item.at <= Date.now()) continue;
    try {
      await showReminderNotification(item, { withTrigger: true });
    } catch {
      // showTrigger недоступен / лимит
    }
  }
}

async function catchUpDueReminders() {
  const items = await readSchedule();
  if (!Array.isArray(items) || !items.length) return;

  const now = Date.now();
  for (const item of items) {
    if (!item?.at || !item.tag) continue;
    const due = item.at <= now && now - item.at <= CATCHUP_WINDOW_MS;
    if (!due) continue;
    if (await wasFired(item.tag)) continue;
    await showReminderNotification(item);
    await markFired(item.tag);
  }
}

async function focusOrOpen(url) {
  const targetUrl = new URL(url || "/", self.location.origin).href;
  const allClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of allClients) {
    if ("focus" in client) {
      await client.focus();
      if ("navigate" in client && client.url !== targetUrl) {
        try {
          await client.navigate(targetUrl);
        } catch {
          // ignore
        }
      }
      return;
    }
  }

  await clients.openWindow(targetUrl);
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.title || "habit";
  const options = {
    body: data.body,
    icon: "/logo.svg",
    badge: "/logo.svg",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    typeof event.notification.data === "string"
      ? event.notification.data
      : event.notification.data?.url || "/";
  event.waitUntil(focusOrOpen(url));
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SHOW_NOTIFICATION") {
    const { title, body, url, tag } = data;
    event.waitUntil(
      showReminderNotification({
        title,
        body,
        url,
        tag: tag || "habit-reminder",
      }),
    );
    return;
  }

  if (data.type === "SCHEDULE_REMINDERS") {
    const tagPrefix = data.tagPrefix || DEFAULT_TAG_PREFIX;
    const items = Array.isArray(data.items) ? data.items : [];
    event.waitUntil(scheduleReminderItems(items, tagPrefix));
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === DEFAULT_PERIODIC_TAG) {
    event.waitUntil(catchUpDueReminders());
  }
});
