import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to unpause"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_unpause",
    "Unpause a paused container",
    inputSchema,
    async (args) => {
      try {
        await execDocker(["unpause", args.containerId]);

        return {
          content: [
            {
              type: "text" as const,
              text: `Container unpaused: ${args.containerId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
