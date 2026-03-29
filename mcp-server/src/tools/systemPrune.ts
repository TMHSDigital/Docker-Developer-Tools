import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove all unused images, not just dangling ones"),
  volumes: z
    .boolean()
    .optional()
    .default(false)
    .describe("Also prune anonymous volumes"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_systemPrune",
    "Remove unused containers, networks, images, and optionally volumes (always non-interactive)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["system", "prune", "-f"];

        if (args.all) {
          cmdArgs.push("--all");
        }

        if (args.volumes) {
          cmdArgs.push("--volumes");
        }

        const output = await execDocker(cmdArgs, { timeout: 120_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Nothing to prune" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
