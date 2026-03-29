import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z.string().min(1).describe("Context name to set as active"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_contextUse",
    "Set the current active Docker context",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["context", "use", args.name]);
        return { content: [{ type: "text" as const, text: output.trim() || `Switched to context '${args.name}'` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
