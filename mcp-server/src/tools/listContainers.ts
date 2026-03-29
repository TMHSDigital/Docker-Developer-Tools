import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  execDocker,
  parseJsonLines,
  errorResponse,
} from "../utils/docker-api.js";

const inputSchema = {
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include stopped containers (default: only running)"),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Maximum number of containers to return"),
  filter: z
    .string()
    .optional()
    .describe(
      "Filter containers by key=value (e.g. 'status=exited', 'name=myapp', 'label=env=prod')",
    ),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_listContainers",
    "List Docker containers with status, ports, names, and resource info",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = [
          "ps",
          "--format",
          "json",
          "--no-trunc",
        ];

        if (args.all) {
          cmdArgs.push("-a");
        }

        if (args.limit !== undefined) {
          cmdArgs.push("-n", String(args.limit));
        }

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        if (!output.trim()) {
          return {
            content: [
              {
                type: "text" as const,
                text: args.all
                  ? "No containers found."
                  : "No running containers. Use all=true to include stopped containers.",
              },
            ],
          };
        }

        const containers = parseJsonLines(output);

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(containers, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
