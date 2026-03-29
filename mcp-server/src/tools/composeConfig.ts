import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  format: z.enum(["yaml", "json"]).optional().describe("Output format (default: yaml)"),
  services: z.array(z.string()).optional().describe("Specific services to include"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeConfig",
    "Validate, resolve, and render a Docker Compose file in canonical format",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("config");
        if (args.format) cmdArgs.push("--format", args.format);
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
