import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove all unused volumes, not just anonymous ones"),
  filter: z
    .string()
    .optional()
    .describe("Filter volumes to prune (e.g. 'label=keep')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_volumePrune",
    "Remove all unused Docker volumes (always non-interactive)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["volume", "prune", "-f"];

        if (args.all) {
          cmdArgs.push("--all");
        }

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No unused volumes to prune" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
