import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  node: z.string().min(1).describe("Node ID or hostname"),
  pretty: z.boolean().optional().default(false).describe("Print in human-readable format"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_nodeInspect",
    "Display detailed information on a Docker Swarm node",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["node", "inspect"];
        if (args.pretty) cmdArgs.push("--pretty");
        cmdArgs.push(args.node);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
