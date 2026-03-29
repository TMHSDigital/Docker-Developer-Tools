import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  nodes: z.array(z.string()).min(1).describe("Node IDs or hostnames to remove"),
  force: z.boolean().optional().default(false).describe("Force remove an active node"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_nodeRm",
    "Remove one or more nodes from the Docker Swarm",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["node", "rm"];
        if (args.force) cmdArgs.push("--force");
        cmdArgs.push(...args.nodes);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed nodes: ${args.nodes.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
