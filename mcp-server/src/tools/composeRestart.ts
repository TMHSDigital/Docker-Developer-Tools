import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z
    .string()
    .optional()
    .describe("Path to compose file"),
  projectDir: z
    .string()
    .optional()
    .describe("Working directory for the compose project"),
  services: z
    .array(z.string())
    .optional()
    .describe("Specific services to restart (default: all)"),
  timeout: z
    .number()
    .optional()
    .describe("Shutdown timeout in seconds (default: 10)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeRestart",
    "Restart Docker Compose services",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];

        if (args.file) {
          cmdArgs.push("-f", args.file);
        }

        if (args.projectDir) {
          cmdArgs.push("--project-directory", args.projectDir);
        }

        cmdArgs.push("restart");

        if (args.timeout !== undefined) {
          cmdArgs.push("--timeout", String(args.timeout));
        }

        if (args.services) {
          cmdArgs.push(...args.services);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Compose services restarted" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
