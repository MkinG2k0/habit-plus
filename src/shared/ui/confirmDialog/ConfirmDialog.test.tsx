import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders title/description and confirms", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Удалить?"
        description="Это необратимо"
        confirmLabel="Удалить"
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Удалить?")).toBeInTheDocument();
    expect(screen.getByText("Это необратимо")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Удалить" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("cancels without confirming", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Удалить?"
        description="desc"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
