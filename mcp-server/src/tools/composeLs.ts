import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  all: z.boolean().optional().default(false).describe("Show all projects including stopped"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
  filter: z.string().optional().describe("Filter projects (e.g. 'status=running')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeLs",
    "List running Docker Compose projects",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose", "ls", "--format", args.format ?? "json"];
        if (args.all) cmdArgs.push("--all");
        if (args.filter) cmdArgs.push("--filter", args.filter);

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No compose projects found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
