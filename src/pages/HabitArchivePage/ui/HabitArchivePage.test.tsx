import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useHabitStore } from "@/entities/habit";
import { HabitArchivePage } from "./HabitArchivePage";

describe("HabitArchivePage", () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], viewMode: "grid" });
  });

  it("shows empty archive state", () => {
    render(
      <MemoryRouter>
        <HabitArchivePage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Архив пуст")).toBeInTheDocument();
  });

  it("lists archived habits and restores them", async () => {
    const user = userEvent.setup();
    useHabitStore.setState({
      habits: [
        {
          id: 7,
          name: "Старая привычка",
          desc: "",
          icon: "book",
          color: "#22c55e",
          completions: {},
          archivedAt: "2026-10-01T00:00:00.000Z",
        },
      ],
    });

    render(
      <MemoryRouter>
        <HabitArchivePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Старая привычка")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Вернуть" }));
    expect(useHabitStore.getState().habits[0]?.archivedAt).toBeUndefined();
  });
});
