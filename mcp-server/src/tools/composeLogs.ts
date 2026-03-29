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
    .describe("Specific services to show logs for (default: all)"),
  tail: z
    .number()
    .optional()
    .describe("Number of lines to show from the end of logs (default: all)"),
  since: z
    .string()
    .optional()
    .describe("Show logs since timestamp or relative (e.g. '2024-01-01', '10m')"),
  timestamps: z
    .boolean()
    .optional()
    .default(false)
    .describe("Show timestamps in log output"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeLogs",
    "View logs for Docker Compose services",
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

        cmdArgs.push("logs", "--no-follow");

        if (args.tail !== undefined) {
          cmdArgs.push("--tail", String(args.tail));
        }

        if (args.since) {
          cmdArgs.push("--since", args.since);
        }

        if (args.timestamps) {
          cmdArgs.push("--timestamps");
        }

        if (args.services) {
          cmdArgs.push(...args.services);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No logs available" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
