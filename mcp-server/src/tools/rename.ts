import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z.string().min(1).describe("Container name or ID"),
  newName: z.string().min(1).describe("New name for the container"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_rename",
    "Rename a Docker container",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["rename", args.containerId, args.newName]);
        return { content: [{ type: "text" as const, text: output.trim() || `Renamed ${args.containerId} to ${args.newName}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
