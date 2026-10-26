import { describe, expect, it } from "vitest";
import { listReminderFiresInHorizon } from "./listReminderFires";

describe("listReminderFiresInHorizon", () => {
  it("returns empty for invalid reminder", () => {
    expect(
      listReminderFiresInHorizon({ id: 1, days: [], time: "10:00" }, new Date()),
    ).toEqual([]);
    expect(
      listReminderFiresInHorizon({ id: 1, days: [0], time: "xx" }, new Date()),
    ).toEqual([]);
  });

  it("lists future fires within horizon", () => {
    const from = new Date(2026, 9, 26, 8, 0, 0, 0); // Monday
    const fires = listReminderFiresInHorizon(
      { id: 1, days: [0, 2], time: "10:00" }, // Mon + Wed
      from,
      7,
    );
    expect(fires.length).toBeGreaterThanOrEqual(2);
    expect(fires.every((d) => d.getTime() > from.getTime())).toBe(true);
    expect(fires.every((d) => d.getHours() === 10)).toBe(true);
  });
});
