import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  volume: z
    .string()
    .min(1)
    .describe("Volume name to inspect"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_volumeInspect",
    "Display detailed information about a Docker volume",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["volume", "inspect", args.volume]);

        return {
          content: [
            { type: "text" as const, text: output.trim() },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
