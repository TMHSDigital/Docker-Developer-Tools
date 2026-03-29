import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxLs",
    "List Docker buildx builder instances",
    {},
    async () => {
      try {
        const output = await execDocker(["buildx", "ls"]);

        return {
          content: [
            { type: "text" as const, text: output.trim() },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
