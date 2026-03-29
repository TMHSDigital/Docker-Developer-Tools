import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image reference to scan (e.g. 'nginx:latest')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_scoutQuickview",
    "Quick overview of image vulnerabilities using Docker Scout (requires Docker Desktop)",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["scout", "quickview", args.image], { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
