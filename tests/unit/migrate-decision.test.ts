import { describe, expect, it } from "vitest";
import { shouldMigrate } from "../../scripts/migrate-decision.mjs";

describe("shouldMigrate", () => {
  it("migrates a production build", () => {
    expect(shouldMigrate("production", "production")).toBe(true);
  });

  it("migrates a preview build that points at the preview branch", () => {
    expect(shouldMigrate("preview", "preview")).toBe(true);
  });

  it("refuses a preview build that points at production", () => {
    expect(shouldMigrate("preview", "production")).toBe(false);
  });

  it("refuses a preview build that points at development", () => {
    expect(shouldMigrate("preview", "development")).toBe(false);
  });

  it("refuses a preview build with no branch named", () => {
    expect(shouldMigrate("preview", undefined)).toBe(false);
  });

  it("refuses outside a Vercel deploy", () => {
    expect(shouldMigrate(undefined, "development")).toBe(false);
    expect(shouldMigrate("development", "preview")).toBe(false);
  });
});
