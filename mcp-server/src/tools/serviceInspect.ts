import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  service: z.string().min(1).describe("Service name or ID"),
  pretty: z.boolean().optional().default(false).describe("Print in human-readable format"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceInspect",
    "Display detailed information on a Docker Swarm service",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "inspect"];
        if (args.pretty) cmdArgs.push("--pretty");
        cmdArgs.push(args.service);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
