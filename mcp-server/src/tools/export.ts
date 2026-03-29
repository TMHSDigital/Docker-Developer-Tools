import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z.string().min(1).describe("Container name or ID"),
  output: z.string().min(1).describe("Output file path for the tar archive"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_export",
    "Export a container's filesystem as a tar archive",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["export", "-o", args.output, args.containerId], { timeout: 300_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Exported ${args.containerId} to ${args.output}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
