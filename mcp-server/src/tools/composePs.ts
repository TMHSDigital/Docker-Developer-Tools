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
    .describe("Specific services to list (default: all)"),
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Show all containers including stopped ones"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composePs",
    "List containers for a Docker Compose project",
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

        cmdArgs.push("ps", "--format", "json");

        if (args.all) {
          cmdArgs.push("-a");
        }

        if (args.services) {
          cmdArgs.push(...args.services);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No compose containers found" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
