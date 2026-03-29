import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  nodes: z.array(z.string()).min(1).describe("Node IDs or hostnames to promote to manager"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_nodePromote",
    "Promote one or more Docker Swarm worker nodes to manager",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["node", "promote", ...args.nodes]);
        return { content: [{ type: "text" as const, text: output.trim() || `Promoted nodes: ${args.nodes.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
