import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  service: z.string().min(1).describe("Service name or ID"),
  tail: z.number().optional().describe("Number of lines from the end of the logs"),
  since: z.string().optional().describe("Show logs since timestamp (e.g. '2024-01-01T00:00:00' or '10m')"),
  timestamps: z.boolean().optional().default(false).describe("Show timestamps"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceLogs",
    "Fetch logs from a Docker Swarm service or task",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "logs", "--no-task-ids"];
        if (args.tail !== undefined) cmdArgs.push("--tail", String(args.tail));
        if (args.since) cmdArgs.push("--since", args.since);
        if (args.timestamps) cmdArgs.push("--timestamps");
        cmdArgs.push(args.service);
        const output = await execDocker(cmdArgs, { timeout: 30_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "No logs available" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
