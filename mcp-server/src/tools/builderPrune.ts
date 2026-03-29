import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove all unused build cache, not just dangling"),
  filter: z
    .string()
    .optional()
    .describe("Filter cache to prune (e.g. 'until=24h')"),
  keepStorage: z
    .string()
    .optional()
    .describe("Amount of disk space to keep for cache (e.g. '10GB')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_builderPrune",
    "Remove Docker buildx build cache (always non-interactive)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "prune", "-f"];

        if (args.all) {
          cmdArgs.push("--all");
        }

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        if (args.keepStorage) {
          cmdArgs.push("--keep-storage", args.keepStorage);
        }

        const output = await execDocker(cmdArgs, { timeout: 120_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No build cache to prune" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
