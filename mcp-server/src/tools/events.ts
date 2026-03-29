import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  since: z
    .string()
    .optional()
    .describe("Show events since timestamp or relative (e.g. '10m', '2024-01-01T00:00:00')"),
  until: z
    .string()
    .optional()
    .describe("Show events until timestamp or relative (defaults to 'now' to prevent blocking)"),
  filter: z
    .array(z.string())
    .optional()
    .describe(
      "Event filters (e.g. 'type=container', 'event=start', 'container=myapp')",
    ),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_events",
    "Stream real-time events from the Docker daemon (returns recent event snapshot)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["events", "--format", "json"];

        if (args.since) {
          cmdArgs.push("--since", args.since);
        } else {
          cmdArgs.push("--since", "1h");
        }

        cmdArgs.push("--until", args.until ?? "0s");

        if (args.filter) {
          for (const f of args.filter) {
            cmdArgs.push("--filter", f);
          }
        }

        const output = await execDocker(cmdArgs, { timeout: 30_000 });

        return {
          content: [
            {
              type: "text" as const,
              text: output.trim() || "No events in the specified time range",
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
