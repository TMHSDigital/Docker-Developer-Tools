import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to fetch logs from"),
  tail: z
    .number()
    .int()
    .positive()
    .optional()
    .default(100)
    .describe("Number of lines from the end of the logs to return (default: 100)"),
  since: z
    .string()
    .optional()
    .describe("Show logs since a timestamp or relative time (e.g. '2024-01-01', '10m', '1h')"),
  timestamps: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include timestamps in log output"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_containerLogs",
    "Fetch recent logs from a container",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["logs", "--tail", String(args.tail)];

        if (args.since) {
          cmdArgs.push("--since", args.since);
        }

        if (args.timestamps) {
          cmdArgs.push("--timestamps");
        }

        cmdArgs.push(args.containerId);

        const output = await execDocker(cmdArgs);

        if (!output.trim()) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No logs found for container: ${args.containerId}`,
              },
            ],
          };
        }

        return {
          content: [{ type: "text" as const, text: output }],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
