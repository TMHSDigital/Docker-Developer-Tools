import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {};

export function register(server: McpServer): void {
  server.tool(
    "docker_contextShow",
    "Print the name of the current Docker context",
    inputSchema,
    async () => {
      try {
        const output = await execDocker(["context", "show"]);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
