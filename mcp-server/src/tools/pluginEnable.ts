import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  plugin: z.string().min(1).describe("Plugin name to enable"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_pluginEnable",
    "Enable a disabled Docker plugin",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["plugin", "enable", args.plugin]);
        return { content: [{ type: "text" as const, text: output.trim() || `Plugin '${args.plugin}' enabled` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
