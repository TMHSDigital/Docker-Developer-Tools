import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  service: z.string().min(1).describe("Service to run the command on"),
  command: z.array(z.string()).optional().describe("Command and arguments to run"),
  rm: z.boolean().optional().default(true).describe("Remove container after exit (default: true)"),
  detach: z.boolean().optional().default(false).describe("Run in background"),
  user: z.string().optional().describe("Run as specified user (e.g. 'root', '1000:1000')"),
  env: z.array(z.string()).optional().describe("Environment variables (e.g. ['KEY=value'])"),
  workdir: z.string().optional().describe("Working directory inside the container"),
  noDeps: z.boolean().optional().default(false).describe("Don't start linked services"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeRun",
    "Run a one-off command on a Docker Compose service",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("run", "--no-TTY");
        if (args.rm) cmdArgs.push("--rm");
        if (args.detach) cmdArgs.push("-d");
        if (args.user) cmdArgs.push("--user", args.user);
        if (args.env) {
          for (const e of args.env) cmdArgs.push("-e", e);
        }
        if (args.workdir) cmdArgs.push("-w", args.workdir);
        if (args.noDeps) cmdArgs.push("--no-deps");
        cmdArgs.push(args.service);
        if (args.command) cmdArgs.push(...args.command);

        const output = await execDocker(cmdArgs, { timeout: 300_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "Command completed" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
