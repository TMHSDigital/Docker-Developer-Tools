import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_contextLs",
    "List available Docker contexts",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["context", "ls", "--format", args.format ?? "json"]);
        return { content: [{ type: "text" as const, text: output.trim() || "No contexts found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
