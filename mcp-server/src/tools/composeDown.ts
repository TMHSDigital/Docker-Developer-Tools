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
  removeVolumes: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove named volumes declared in the volumes section"),
  removeImages: z
    .string()
    .optional()
    .describe("Remove images: 'all' or 'local' (built without a custom tag)"),
  timeout: z
    .number()
    .optional()
    .describe("Shutdown timeout in seconds (default: 10)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeDown",
    "Stop and remove Compose containers, networks, and optionally volumes/images",
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

        cmdArgs.push("down");

        if (args.removeVolumes) {
          cmdArgs.push("--volumes");
        }

        if (args.removeImages) {
          cmdArgs.push("--rmi", args.removeImages);
        }

        if (args.timeout !== undefined) {
          cmdArgs.push("--timeout", String(args.timeout));
        }

        const output = await execDocker(cmdArgs, { timeout: 120_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Compose services stopped and removed" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
