import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z.string().min(1).describe("Context name to inspect"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_contextInspect",
    "Display detailed information on a Docker context",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["context", "inspect", args.name]);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
