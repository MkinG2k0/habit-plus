import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
  it("renders settings sections and quiz entry", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Настройки")).toBeInTheDocument();
    expect(screen.getByText("Квиз баланса сфер")).toBeInTheDocument();
    expect(screen.getByText("Архив привычек")).toBeInTheDocument();
    expect(screen.getByText("Импорт/Экспорт данных")).toBeInTheDocument();
  });
});
