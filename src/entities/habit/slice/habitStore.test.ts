import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatLocalDateKey } from "../lib/computeHabitStreak";
import { useHabitStore } from "./habitStore";

describe("useHabitStore", () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], viewMode: "grid" });
  });

  it("adds, updates, archives, unarchives and deletes habits", () => {
    useHabitStore.getState().addHabit({
      name: "Read",
      desc: "1 chapter",
      icon: "book",
      color: "#22c55e",
    });
    const created = useHabitStore.getState().habits[0];
    expect(created?.name).toBe("Read");
    expect(created?.completions).toEqual({});

    const id = created!.id;
    useHabitStore.getState().updateHabit(id, { desc: "2 chapters" });
    expect(useHabitStore.getState().habits[0]?.desc).toBe("2 chapters");

    useHabitStore.getState().archiveHabit(id);
    expect(useHabitStore.getState().habits[0]?.archivedAt).toBeTruthy();

    useHabitStore.getState().unarchiveHabit(id);
    expect(useHabitStore.getState().habits[0]?.archivedAt).toBeUndefined();

    useHabitStore.getState().deleteHabit(id);
    expect(useHabitStore.getState().habits).toHaveLength(0);
  });

  it("toggles today and date completion for step tracking", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 26, 12, 0, 0));

    useHabitStore.getState().addHabit({
      name: "Walk",
      desc: "",
      icon: "sport",
      color: "#3b82f6",
      trackingMode: "step",
    });
    const id = useHabitStore.getState().habits[0]!.id;
    const today = formatLocalDateKey(new Date());

    useHabitStore.getState().toggleToday(id);
    expect(useHabitStore.getState().habits[0]?.completions[today]).toBe(true);

    useHabitStore.getState().toggleToday(id);
    expect(useHabitStore.getState().habits[0]?.completions[today]).toBe(false);

    useHabitStore.getState().toggleDateCompletion(id, "2026-10-20");
    expect(useHabitStore.getState().habits[0]?.completions["2026-10-20"]).toBe(
      true,
    );

    vi.useRealTimers();
  });

  it("does not toggle step completion in custom tracking mode", () => {
    useHabitStore.setState({
      habits: [
        {
          id: 1,
          name: "Pages",
          desc: "",
          icon: "book",
          color: "#22c55e",
          completions: {},
          trackingMode: "custom",
        },
      ],
    });
    useHabitStore.getState().toggleToday(1);
    useHabitStore.getState().toggleDateCompletion(1, "2026-10-26");
    expect(useHabitStore.getState().habits[0]?.completions).toEqual({});
  });

  it("sets and clears custom day values", () => {
    useHabitStore.setState({
      habits: [
        {
          id: 1,
          name: "Pages",
          desc: "",
          icon: "book",
          color: "#22c55e",
          completions: {},
          trackingMode: "custom",
        },
      ],
    });
    useHabitStore.getState().setHabitDayCompletionValue(1, "2026-10-26", 5);
    expect(useHabitStore.getState().habits[0]?.completions["2026-10-26"]).toBe(5);
    useHabitStore.getState().setHabitDayCompletionValue(1, "2026-10-26", 0);
    expect(
      useHabitStore.getState().habits[0]?.completions["2026-10-26"],
    ).toBeUndefined();
  });

  it("changes view mode", () => {
    useHabitStore.getState().setViewMode("list");
    expect(useHabitStore.getState().viewMode).toBe("list");
  });
});
