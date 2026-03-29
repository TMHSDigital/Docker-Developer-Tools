import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  network: z
    .string()
    .min(1)
    .describe("Network name or ID to inspect"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_networkInspect",
    "Display detailed information about a Docker network",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["network", "inspect", args.network]);

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
