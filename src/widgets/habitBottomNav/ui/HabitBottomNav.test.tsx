import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HabitBottomNav } from "./HabitBottomNav";

describe("HabitBottomNav", () => {
  it("switches view modes", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    render(<HabitBottomNav view="grid" onView={onView} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);

    await user.click(buttons[1]!);
    expect(onView).toHaveBeenCalledWith("list");

    await user.click(buttons[2]!);
    expect(onView).toHaveBeenCalledWith("cols");
  });
});
