import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  source: z
    .string()
    .min(1)
    .describe(
      "Source path - 'container:/path' for container source or local path",
    ),
  destination: z
    .string()
    .min(1)
    .describe(
      "Destination path - 'container:/path' for container destination or local path",
    ),
  archive: z
    .boolean()
    .optional()
    .default(false)
    .describe("Archive mode - copy all uid/gid information"),
  followLink: z
    .boolean()
    .optional()
    .default(false)
    .describe("Always follow symbolic links in source"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_cp",
    "Copy files or directories between a container and the local filesystem",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["cp"];

        if (args.archive) {
          cmdArgs.push("--archive");
        }

        if (args.followLink) {
          cmdArgs.push("--follow-link");
        }

        cmdArgs.push(args.source, args.destination);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });

        return {
          content: [
            {
              type: "text" as const,
              text:
                output.trim() ||
                `Copied ${args.source} to ${args.destination}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
