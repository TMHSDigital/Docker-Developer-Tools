import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z
    .string()
    .optional()
    .describe("Path to compose file (default: compose.yaml / docker-compose.yml)"),
  projectDir: z
    .string()
    .optional()
    .describe("Working directory for the compose project"),
  services: z
    .array(z.string())
    .optional()
    .describe("Specific services to start (default: all)"),
  build: z
    .boolean()
    .optional()
    .default(false)
    .describe("Build images before starting containers"),
  pull: z
    .string()
    .optional()
    .describe("Pull policy: 'always', 'missing', 'never'"),
  forceRecreate: z
    .boolean()
    .optional()
    .default(false)
    .describe("Recreate containers even if config and images haven't changed"),
  removeOrphans: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove containers for services not defined in the compose file"),
  profiles: z
    .array(z.string())
    .optional()
    .describe("Profiles to enable (e.g. ['debug', 'monitoring'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeUp",
    "Create and start Docker Compose services (always detached)",
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

        if (args.profiles) {
          for (const p of args.profiles) {
            cmdArgs.push("--profile", p);
          }
        }

        cmdArgs.push("up", "-d");

        if (args.build) {
          cmdArgs.push("--build");
        }

        if (args.pull) {
          cmdArgs.push("--pull", args.pull);
        }

        if (args.forceRecreate) {
          cmdArgs.push("--force-recreate");
        }

        if (args.removeOrphans) {
          cmdArgs.push("--remove-orphans");
        }

        if (args.services) {
          cmdArgs.push(...args.services);
        }

        const output = await execDocker(cmdArgs, { timeout: 300_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Compose services started" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
