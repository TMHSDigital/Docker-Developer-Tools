import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  composeFile: z.string().min(1).describe("Path to the compose file"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_stackConfig",
    "Output the final merged configuration for a Docker Swarm stack",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["stack", "config", "-c", args.composeFile]);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
