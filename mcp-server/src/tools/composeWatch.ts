import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  projectDirectory: z.string().min(1).describe("Path to the Compose project directory"),
  services: z.array(z.string()).optional().describe("Services to watch (default: all)"),
  noUp: z.boolean().optional().default(false).describe("Do not build and start services before watching"),
  quiet: z.boolean().optional().default(false).describe("Hide build output"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeWatch",
    "Watch build context for Compose services and auto-rebuild on file changes (blocks up to 2 minutes)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose", "--project-directory", args.projectDirectory, "watch"];
        if (args.noUp) cmdArgs.push("--no-up");
        if (args.quiet) cmdArgs.push("--quiet");
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "Watch session ended" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
