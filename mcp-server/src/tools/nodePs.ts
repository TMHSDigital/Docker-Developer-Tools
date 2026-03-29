import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  node: z.string().optional().describe("Node ID or hostname (defaults to current node)"),
  filter: z.array(z.string()).optional().describe("Filters (e.g. ['desired-state=running'])"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_nodePs",
    "List tasks running on a Docker Swarm node",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["node", "ps", "--format", args.format ?? "json"];
        if (args.filter) for (const f of args.filter) cmdArgs.push("--filter", f);
        if (args.node) cmdArgs.push(args.node);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No tasks found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
