import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  secrets: z.array(z.string()).min(1).describe("Secret names or IDs to remove"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_secretRm",
    "Remove one or more Docker Swarm secrets",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["secret", "rm", ...args.secrets]);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed secrets: ${args.secrets.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
