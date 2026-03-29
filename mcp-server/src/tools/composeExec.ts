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
  service: z
    .string()
    .min(1)
    .describe("Service name to execute the command in"),
  command: z
    .array(z.string())
    .min(1)
    .describe("Command and arguments to execute (e.g. ['sh', '-c', 'echo hello'])"),
  user: z
    .string()
    .optional()
    .describe("Run as this user (e.g. 'root', '1000')"),
  workdir: z
    .string()
    .optional()
    .describe("Working directory inside the container"),
  env: z
    .array(z.string())
    .optional()
    .describe("Environment variables as 'KEY=VALUE'"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeExec",
    "Execute a command in a running Docker Compose service container",
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

        cmdArgs.push("exec", "-T");

        if (args.user) {
          cmdArgs.push("--user", args.user);
        }

        if (args.workdir) {
          cmdArgs.push("--workdir", args.workdir);
        }

        if (args.env) {
          for (const e of args.env) {
            cmdArgs.push("-e", e);
          }
        }

        cmdArgs.push(args.service, ...args.command);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
