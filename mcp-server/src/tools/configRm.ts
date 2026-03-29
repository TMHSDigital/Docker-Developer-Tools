import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  configs: z.array(z.string()).min(1).describe("Config names or IDs to remove"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_configRm",
    "Remove one or more Docker Swarm configs",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["config", "rm", ...args.configs]);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed configs: ${args.configs.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
