import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  plugin: z.string().min(1).describe("Plugin to install (e.g. 'vieux/sshfs')"),
  grantAllPermissions: z.boolean().optional().default(true).describe("Grant all permissions required by the plugin"),
  alias: z.string().optional().describe("Local name for the plugin"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_pluginInstall",
    "Install a Docker plugin from a registry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["plugin", "install"];
        if (args.grantAllPermissions) cmdArgs.push("--grant-all-permissions");
        if (args.alias) cmdArgs.push("--alias", args.alias);
        cmdArgs.push(args.plugin);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Plugin '${args.plugin}' installed` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
