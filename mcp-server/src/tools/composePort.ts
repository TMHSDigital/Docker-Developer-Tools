import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  service: z.string().min(1).describe("Service name"),
  privatePort: z.number().describe("Private port number to query"),
  protocol: z.enum(["tcp", "udp"]).optional().describe("Protocol (default: tcp)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composePort",
    "Print the public port for a Docker Compose service port binding",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("port");
        if (args.protocol) cmdArgs.push("--protocol", args.protocol);
        cmdArgs.push(args.service, String(args.privatePort));

        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
