import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove all unused images, not just dangling ones"),
  filter: z
    .string()
    .optional()
    .describe("Filter images to prune (e.g. 'until=24h', 'label=temp')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_imagePrune",
    "Remove unused Docker images (always non-interactive)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["image", "prune", "-f"];

        if (args.all) {
          cmdArgs.push("--all");
        }

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs, { timeout: 60_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No unused images to prune" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
