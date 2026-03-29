import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  term: z
    .string()
    .min(1)
    .describe("Search term to look up on Docker Hub (e.g. 'nginx', 'postgres', 'node')"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(25)
    .describe("Maximum number of results to return (default: 25, max: 100)"),
  filter: z
    .string()
    .optional()
    .describe("Filter results (e.g. 'is-official=true', 'stars=10')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_searchHub",
    "Search Docker Hub for images by name",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = [
          "search",
          "--format",
          "json",
          "--limit",
          String(args.limit),
        ];

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        cmdArgs.push(args.term);

        const output = await execDocker(cmdArgs);

        if (!output.trim()) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No images found on Docker Hub for: ${args.term}`,
              },
            ],
          };
        }

        const lines = output.trim().split("\n").filter(Boolean);
        const results = lines.map((line) => JSON.parse(line));

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(results, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
