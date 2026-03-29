import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  service: z.string().min(1).describe("Service name or ID"),
  detach: z.boolean().optional().default(false).describe("Return immediately instead of waiting"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceRollback",
    "Revert a Docker Swarm service to its previous configuration",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "rollback"];
        if (args.detach) cmdArgs.push("--detach");
        cmdArgs.push(args.service);
        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Service '${args.service}' rolled back` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
