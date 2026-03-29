import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsDir = join(__dirname, "..");

const toolFiles = readdirSync(toolsDir)
  .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
  .sort();

describe("MCP tool exports", () => {
  it("should have exactly 150 tool files", () => {
    expect(toolFiles.length).toBe(150);
  });

  it.each(toolFiles)("%s exports a register function", async (file) => {
    const mod = await import(join(toolsDir, file));
    expect(mod.register).toBeDefined();
    expect(typeof mod.register).toBe("function");
  });
});
