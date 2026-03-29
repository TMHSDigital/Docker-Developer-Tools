import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe("Filter containers to prune (e.g. 'until=24h', 'label=disposable')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_containerPrune",
    "Remove all stopped containers (always non-interactive)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["container", "prune", "-f"];

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No stopped containers to prune" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
