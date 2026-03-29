import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to wait for"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_wait",
    "Block until a container stops and return its exit code",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["wait", args.containerId], {
          timeout: 300_000,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Container ${args.containerId} exited with code: ${output.trim()}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
