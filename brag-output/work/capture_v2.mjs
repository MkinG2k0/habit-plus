/**
 * Capture Habiday demo screenshots for brag video.
 * Run: BRAG_BASE_URL=http://localhost:5173 node brag-output/work/capture_v2.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.BRAG_BASE_URL || "http://localhost:5173";

async function shot(page, name) {
  await page.screenshot({
    path: path.join(OUT, name),
    type: "png",
    animations: "disabled",
  });
  console.log("shot", name);
}

async function fireInstall(page) {
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(e, "prompt", { value: async () => {} });
    Object.defineProperty(e, "userChoice", {
      value: Promise.resolve({ outcome: "dismissed", platform: "" }),
    });
    window.dispatchEvent(e);
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Deterministic quiz order → family question first (not spirituality)
  await page.addInitScript(() => {
    Math.random = () => 0.999;
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`${BASE}/quiz`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await shot(page, "01-quiz-intro.png");

  await page.getByRole("button", { name: "Начать квиз" }).click();
  await page.waitForTimeout(300);
  await shot(page, "02-quiz-q1.png");

  for (let i = 0; i < 60; i++) {
    const onResults = await page
      .getByRole("heading", { name: "Твоё внимание к сферам" })
      .isVisible()
      .catch(() => false);
    if (onResults) break;

    const choices = page.locator(
      ".overflow-y-auto .flex.flex-col.gap-2 > button",
    );
    const count = await choices.count();
    if (count === 0) {
      await page.waitForTimeout(80);
      continue;
    }
    await choices.nth(Math.min(1, count - 1)).click();
    if (i === 14) {
      await page.waitForTimeout(150);
      await shot(page, "03-quiz-progress.png");
    } else {
      await page.waitForTimeout(25);
    }
  }

  await page
    .getByRole("heading", { name: "Твоё внимание к сферам" })
    .waitFor({ timeout: 20000 });
  await page.waitForTimeout(400);
  await shot(page, "04-quiz-results.png");

  await page.evaluate(() => {
    const scroller = document.querySelector(".overflow-y-auto");
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
  await page.waitForTimeout(300);
  await shot(page, "05-quiz-recs.png");

  const addBtn = page.getByRole("button", { name: /Добавить выбранные/ });
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
  } else {
    await page.getByRole("button", { name: "Готово" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("quiz"), {
    timeout: 10000,
  });
  await page.waitForTimeout(500);

  // Diverse card colors for the demo (quiz templates often share one accent)
  await page.evaluate(async () => {
    const { useHabitStore } = await import("/src/entities/habit/index.ts");
    const palette = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#14b8a6",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f43f5e",
    ];
    const { habits, updateHabit } = useHabitStore.getState();
    habits.forEach((h, i) => {
      updateHabit(h.id, { color: palette[i % palette.length] });
    });
  });
  await page.waitForTimeout(400);
  await shot(page, "06-home-grid.png");

  const navTabs = page.locator(
    "div.flex.items-center.gap-4.rounded-full.border button",
  );
  await navTabs.nth(1).click();
  await page.waitForTimeout(350);
  await shot(page, "07-list-view.png");

  const dayBtns = page.locator('button[aria-label^="Переключить"]');
  const dayCount = await dayBtns.count();
  if (dayCount > 0) {
    await dayBtns.nth(Math.max(0, dayCount - 3)).click();
    await page.waitForTimeout(220);
    await shot(page, "08-day-one.png");
    if (dayCount > 1) {
      await dayBtns.nth(Math.max(0, dayCount - 2)).click();
      await page.waitForTimeout(220);
      await shot(page, "09-day-two.png");
    }
    if (dayCount > 2) {
      await dayBtns.nth(Math.max(0, dayCount - 1)).click();
      await page.waitForTimeout(220);
      await shot(page, "10-days-filled.png");
    }
  }

  const listRowTitle = page
    .locator(".overflow-y-auto p.font-medium, .overflow-y-auto .font-medium")
    .first();
  if (await listRowTitle.isVisible().catch(() => false)) {
    await listRowTitle.click();
    await page.waitForTimeout(450);
    await shot(page, "11-habit-detail.png");

    const shareBtn = page.getByRole("button", { name: "Поделиться привычкой" });
    if (await shareBtn.isVisible().catch(() => false)) {
      await shareBtn.click();
      await page.waitForTimeout(500);
      await shot(page, "12-habit-share.png");
      await page.getByRole("button", { name: "Закрыть" }).click();
      await page.waitForTimeout(300);
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  await navTabs.nth(0).click();
  await page.waitForTimeout(300);
  await shot(page, "14-view-grid.png");

  // Enrich completions so stats look alive
  await page.evaluate(async () => {
    const { useHabitStore, formatLocalDateKey } = await import(
      "/src/entities/habit/index.ts"
    );
    const { habits } = useHabitStore.getState();
    useHabitStore.setState({
      habits: habits.map((h, hi) => {
        const completions = { ...h.completions };
        for (let d = 0; d < 14; d++) {
          if ((hi + d) % 3 === 0) continue;
          const day = new Date();
          day.setDate(day.getDate() - d);
          completions[formatLocalDateKey(day)] = true;
        }
        return { ...h, completions };
      }),
    });
  });
  await page.waitForTimeout(300);

  await page.getByRole("button", { name: "Статистика" }).click();
  await page.waitForURL("**/stats**");
  await page.waitForTimeout(500);
  await shot(page, "14b-stats.png");
  await page.evaluate(() => {
    const scroller = document.querySelector(".overflow-y-auto");
    if (scroller) scroller.scrollTop = 420;
  });
  await page.waitForTimeout(300);
  await shot(page, "14c-stats-habits.png");
  await page.getByRole("button", { name: "Назад" }).click();
  await page.waitForTimeout(400);

  await fireInstall(page);
  await page.waitForTimeout(500);
  await shot(page, "15-pwa-banner.png");

  await page.getByRole("button", { name: "Настройки" }).click();
  await page.waitForURL("**/settings**");
  await page.waitForTimeout(400);
  await fireInstall(page);
  await page.waitForTimeout(400);
  await shot(page, "16-settings-install.png");

  await page.evaluate(() => {
    const scroller = document.querySelector(".overflow-y-auto");
    if (scroller) scroller.scrollTop = 280;
  });
  await page.waitForTimeout(250);
  await shot(page, "17-settings-quiz.png");

  await page.getByRole("button", { name: "Закрыть" }).click();
  await page.waitForTimeout(500);
  await fireInstall(page);
  const later = page.getByRole("button", { name: "Не сейчас" });
  if (await later.isVisible().catch(() => false)) {
    await later.click();
    await page.waitForTimeout(250);
  }
  await navTabs.nth(0).click().catch(() => {});
  await page.waitForTimeout(250);
  await shot(page, "18-outro.png");

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
