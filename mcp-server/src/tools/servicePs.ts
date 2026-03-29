import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  service: z.string().min(1).describe("Service name or ID"),
  filter: z.array(z.string()).optional().describe("Filters (e.g. ['desired-state=running'])"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_servicePs",
    "List tasks (containers) of a Docker Swarm service",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "ps", "--format", args.format ?? "json"];
        if (args.filter) for (const f of args.filter) cmdArgs.push("--filter", f);
        cmdArgs.push(args.service);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No tasks found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
