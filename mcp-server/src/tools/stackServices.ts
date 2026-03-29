import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  stack: z.string().min(1).describe("Stack name"),
  filter: z.array(z.string()).optional().describe("Filters (e.g. ['name=web'])"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_stackServices",
    "List services in a Docker Swarm stack",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["stack", "services", "--format", args.format ?? "json"];
        if (args.filter) for (const f of args.filter) cmdArgs.push("--filter", f);
        cmdArgs.push(args.stack);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No services found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
