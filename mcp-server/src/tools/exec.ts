import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to execute the command in"),
  command: z
    .array(z.string())
    .min(1)
    .describe("Command and arguments to execute (e.g. ['ls', '-la', '/app'])"),
  workdir: z
    .string()
    .optional()
    .describe("Working directory inside the container"),
  user: z
    .string()
    .optional()
    .describe("Username or UID to run the command as (e.g. 'root', '1000')"),
  env: z
    .array(z.string())
    .optional()
    .describe("Environment variables as 'KEY=VALUE' for the exec session"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_exec",
    "Execute a command in a running container and return its output",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["exec"];

        if (args.workdir) {
          cmdArgs.push("-w", args.workdir);
        }

        if (args.user) {
          cmdArgs.push("-u", args.user);
        }

        if (args.env) {
          for (const e of args.env) {
            cmdArgs.push("-e", e);
          }
        }

        cmdArgs.push(args.containerId, ...args.command);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            {
              type: "text" as const,
              text: output || "(no output)",
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
