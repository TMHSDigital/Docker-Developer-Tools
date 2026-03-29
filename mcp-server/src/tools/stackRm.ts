import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  stacks: z.array(z.string()).min(1).describe("Stack names to remove"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_stackRm",
    "Remove one or more Docker Swarm stacks",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["stack", "rm", ...args.stacks]);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed stacks: ${args.stacks.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
