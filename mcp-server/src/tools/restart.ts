import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to restart"),
  time: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Seconds to wait before killing the container (default: 10)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_restart",
    "Restart a container with an optional grace period",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["restart"];

        if (args.time !== undefined) {
          cmdArgs.push("-t", String(args.time));
        }

        cmdArgs.push(args.containerId);

        await execDocker(cmdArgs);

        return {
          content: [
            {
              type: "text" as const,
              text: `Container restarted: ${args.containerId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
