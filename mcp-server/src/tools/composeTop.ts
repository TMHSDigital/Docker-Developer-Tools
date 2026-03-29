import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  services: z.array(z.string()).optional().describe("Specific services to display processes for (default: all)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeTop",
    "Display running processes in Docker Compose service containers",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("top");
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No running processes found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
