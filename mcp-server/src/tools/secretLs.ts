import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  filter: z.array(z.string()).optional().describe("Filters (e.g. ['name=my-secret'])"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_secretLs",
    "List Docker Swarm secrets",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["secret", "ls", "--format", args.format ?? "json"];
        if (args.filter) for (const f of args.filter) cmdArgs.push("--filter", f);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No secrets found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
