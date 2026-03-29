import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  plugins: z.array(z.string()).min(1).describe("Plugin names to remove"),
  force: z.boolean().optional().default(false).describe("Force remove even if active"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_pluginRm",
    "Remove one or more Docker plugins",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["plugin", "rm"];
        if (args.force) cmdArgs.push("--force");
        cmdArgs.push(...args.plugins);

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Removed: ${args.plugins.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
