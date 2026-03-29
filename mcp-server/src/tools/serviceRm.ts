import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  services: z.array(z.string()).min(1).describe("Service names or IDs to remove"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceRm",
    "Remove one or more Docker Swarm services",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["service", "rm", ...args.services]);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed services: ${args.services.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
