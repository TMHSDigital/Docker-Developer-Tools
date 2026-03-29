import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  source: z.string().min(1).describe("Source path - use 'service:/path' for container source or local path"),
  destination: z.string().min(1).describe("Destination path - use 'service:/path' for container destination or local path"),
  archive: z.boolean().optional().default(false).describe("Archive mode - copy all uid/gid information"),
  index: z.number().optional().describe("Index of the container if service has multiple replicas"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeCp",
    "Copy files between a Docker Compose service container and the local filesystem",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("cp");
        if (args.archive) cmdArgs.push("--archive");
        if (args.index !== undefined) cmdArgs.push("--index", String(args.index));
        cmdArgs.push(args.source, args.destination);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Copied ${args.source} to ${args.destination}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
