import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label text", () => {
    render(<Button>Upload New Document</Button>);
    expect(screen.getByRole("button", { name: "Upload New Document" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Analyse Document</Button>);

    await user.click(screen.getByRole("button", { name: "Analyse Document" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} disabled>
        Analyse Document
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Analyse Document" }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
