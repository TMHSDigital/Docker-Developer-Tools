import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

export function register(server: McpServer): void {
  server.tool(
    "docker_systemInfo",
    "Get Docker system information including version, OS, storage driver, and resource limits",
    {},
    async () => {
      try {
        const output = await execDocker(["info", "--format", "json"]);
        const data = JSON.parse(output);

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
