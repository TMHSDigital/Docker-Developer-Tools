import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name"),
  psArgs: z
    .string()
    .optional()
    .describe("Arguments to pass to ps (e.g. 'aux', '-ef')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_top",
    "Show running processes in a container",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["top", args.containerId];

        if (args.psArgs) {
          cmdArgs.push(args.psArgs);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            {
              type: "text" as const,
              text: output.trim() || "No processes found",
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
