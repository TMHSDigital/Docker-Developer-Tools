import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  secret: z.string().min(1).describe("Secret name or ID"),
  pretty: z.boolean().optional().default(false).describe("Print in human-readable format"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_secretInspect",
    "Display detailed information on a Docker Swarm secret (metadata only, not the value)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["secret", "inspect"];
        if (args.pretty) cmdArgs.push("--pretty");
        cmdArgs.push(args.secret);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
