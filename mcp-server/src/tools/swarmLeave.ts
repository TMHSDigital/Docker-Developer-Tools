import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  force: z.boolean().optional().default(false).describe("Force leave even if this is the last manager"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmLeave",
    "Leave the Docker Swarm",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "leave"];
        if (args.force) cmdArgs.push("--force");
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "Node left the swarm" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
