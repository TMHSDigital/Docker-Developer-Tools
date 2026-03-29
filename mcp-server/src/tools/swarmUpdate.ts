import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  taskHistoryLimit: z.number().optional().describe("Task history retention limit"),
  snapshotInterval: z.number().optional().describe("Number of log entries between Raft snapshots"),
  autolock: z.boolean().optional().describe("Enable or disable manager autolocking"),
  certExpiry: z.string().optional().describe("Validity period for node certificates (e.g. '720h')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmUpdate",
    "Update the Docker Swarm configuration",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "update"];
        if (args.taskHistoryLimit !== undefined) cmdArgs.push("--task-history-limit", String(args.taskHistoryLimit));
        if (args.snapshotInterval !== undefined) cmdArgs.push("--snapshot-interval", String(args.snapshotInterval));
        if (args.autolock !== undefined) cmdArgs.push("--autolock=" + String(args.autolock));
        if (args.certExpiry) cmdArgs.push("--cert-expiry", args.certExpiry);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "Swarm updated" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
