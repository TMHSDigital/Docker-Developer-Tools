import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  node: z.string().min(1).describe("Node ID or hostname"),
  availability: z.enum(["active", "pause", "drain"]).optional().describe("Node availability"),
  role: z.enum(["worker", "manager"]).optional().describe("Node role"),
  labels: z.array(z.string()).optional().describe("Labels to add (e.g. ['env=production', 'region=us-east'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_nodeUpdate",
    "Update metadata on a Docker Swarm node (availability, role, labels)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["node", "update"];
        if (args.availability) cmdArgs.push("--availability", args.availability);
        if (args.role) cmdArgs.push("--role", args.role);
        if (args.labels) for (const l of args.labels) cmdArgs.push("--label-add", l);
        cmdArgs.push(args.node);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Node '${args.node}' updated` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
