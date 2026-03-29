import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

export function register(server: McpServer): void {
  server.tool(
    "docker_pluginLs",
    "List installed Docker plugins",
    {},
    async () => {
      try {
        const output = await execDocker(["plugin", "ls", "--format", "json"]);
        return { content: [{ type: "text" as const, text: output.trim() || "No plugins installed" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
