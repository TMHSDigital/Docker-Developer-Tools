import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

export function register(server: McpServer): void {
  server.tool(
    "docker_composeVersion",
    "Show Docker Compose version information",
    {},
    async () => {
      try {
        const output = await execDocker(["compose", "version", "--format", "json"]);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
