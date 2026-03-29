import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z.string().min(1).describe("Container name or ID"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_diff",
    "Inspect filesystem changes in a container (added, changed, deleted files)",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["diff", args.containerId]);
        return { content: [{ type: "text" as const, text: output.trim() || "No filesystem changes detected" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
