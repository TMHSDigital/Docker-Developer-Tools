import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

export function register(server: McpServer): void {
  server.tool(
    "docker_version",
    "Show Docker client and server version information",
    {},
    async () => {
      try {
        const output = await execDocker(["version", "--format", "json"]);
        const data = JSON.parse(output);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
