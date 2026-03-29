import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containers: z
    .array(z.string())
    .optional()
    .describe(
      "Container IDs or names to show stats for (omit for all running containers)",
    ),
  noStream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Disable streaming and return a single snapshot (default true)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_stats",
    "Show live resource usage statistics for containers (CPU, memory, network I/O)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["stats", "--format", "json"];

        if (args.noStream !== false) {
          cmdArgs.push("--no-stream");
        }

        if (args.containers && args.containers.length > 0) {
          cmdArgs.push(...args.containers);
        }

        const output = await execDocker(cmdArgs, { timeout: 30_000 });

        return {
          content: [
            {
              type: "text" as const,
              text: output.trim() || "No running containers",
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
