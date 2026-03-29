import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image reference to get recommendations for (e.g. 'nginx:latest')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_scoutRecommendations",
    "Get base image update recommendations using Docker Scout (requires Docker Desktop)",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["scout", "recommendations", args.image], { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "No recommendations available" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
