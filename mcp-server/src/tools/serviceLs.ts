import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  filter: z.array(z.string()).optional().describe("Filters (e.g. ['name=web', 'mode=replicated'])"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceLs",
    "List Docker Swarm services",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "ls", "--format", args.format ?? "json"];
        if (args.filter) for (const f of args.filter) cmdArgs.push("--filter", f);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No services found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
