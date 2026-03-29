import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  services: z.array(z.string()).optional().describe("Specific services to kill (default: all)"),
  signal: z.string().optional().describe("Signal to send (e.g. 'SIGKILL', 'SIGTERM')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeKill",
    "Force stop Docker Compose service containers by sending a signal",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("kill");
        if (args.signal) cmdArgs.push("-s", args.signal);
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "Services killed" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
