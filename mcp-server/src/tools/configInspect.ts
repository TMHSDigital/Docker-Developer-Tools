import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  config: z.string().min(1).describe("Config name or ID"),
  pretty: z.boolean().optional().default(false).describe("Print in human-readable format"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_configInspect",
    "Display detailed information on a Docker Swarm config",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["config", "inspect"];
        if (args.pretty) cmdArgs.push("--pretty");
        cmdArgs.push(args.config);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
