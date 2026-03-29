import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

export function register(server: McpServer): void {
  server.tool(
    "docker_diskUsage",
    "Get Docker disk usage breakdown for images, containers, volumes, and build cache",
    {},
    async () => {
      try {
        const output = await execDocker([
          "system",
          "df",
          "--format",
          "json",
        ]);

        const lines = output.trim().split("\n").filter(Boolean);
        const usage = lines.map((line) => JSON.parse(line));

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(usage, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
