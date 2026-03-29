import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  services: z.array(z.string()).optional().describe("Specific services to stop (default: all)"),
  timeout: z.number().optional().describe("Seconds to wait for graceful stop before killing"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeStop",
    "Stop Docker Compose services without removing containers",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("stop");
        if (args.timeout !== undefined) cmdArgs.push("-t", String(args.timeout));
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "Services stopped" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
