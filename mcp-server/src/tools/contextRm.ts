import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  names: z.array(z.string()).min(1).describe("Context names to remove"),
  force: z.boolean().optional().default(false).describe("Force removal of a context in use"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_contextRm",
    "Remove one or more Docker contexts",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["context", "rm"];
        if (args.force) cmdArgs.push("--force");
        cmdArgs.push(...args.names);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed contexts: ${args.names.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
