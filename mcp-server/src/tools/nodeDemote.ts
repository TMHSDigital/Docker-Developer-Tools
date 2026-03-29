import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  nodes: z.array(z.string()).min(1).describe("Node IDs or hostnames to demote to worker"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_nodeDemote",
    "Demote one or more Docker Swarm manager nodes to worker",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["node", "demote", ...args.nodes]);
        return { content: [{ type: "text" as const, text: output.trim() || `Demoted nodes: ${args.nodes.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
