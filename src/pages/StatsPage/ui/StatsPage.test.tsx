import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useHabitStore } from "@/entities/habit";
import { formatLocalDateKey } from "@/entities/habit";
import { StatsPage } from "./StatsPage";

describe("StatsPage", () => {
  beforeEach(() => {
    useHabitStore.setState({ habits: [], viewMode: "grid" });
  });

  it("shows empty state when there are no active habits", () => {
    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Пока нечего считать")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Добавить привычку" }),
    ).toBeInTheDocument();
  });

  it("renders summary metrics for seeded habits", () => {
    const today = formatLocalDateKey(new Date());
    useHabitStore.setState({
      habits: [
        {
          id: 1,
          name: "Чтение",
          desc: "",
          icon: "book",
          color: "#8b5cf6",
          streakInterval: "daily",
          completions: { [today]: true },
        },
      ],
    });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Статистика")).toBeInTheDocument();
    expect(screen.getByLabelText("Сводка")).toBeInTheDocument();
    expect(screen.getByText("Чтение")).toBeInTheDocument();
  });
});
