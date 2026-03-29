import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container name or ID to commit"),
  repository: z
    .string()
    .optional()
    .describe("Repository name for the new image (e.g. 'myapp')"),
  tag: z
    .string()
    .optional()
    .describe("Tag for the new image (e.g. 'v1.0')"),
  message: z
    .string()
    .optional()
    .describe("Commit message"),
  author: z
    .string()
    .optional()
    .describe("Author (e.g. 'Name <email>')"),
  pause: z
    .boolean()
    .optional()
    .default(true)
    .describe("Pause container during commit (default: true)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_commit",
    "Create a new image from a container's changes",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["commit"];

        if (args.message) {
          cmdArgs.push("-m", args.message);
        }

        if (args.author) {
          cmdArgs.push("-a", args.author);
        }

        if (!args.pause) {
          cmdArgs.push("--pause=false");
        }

        cmdArgs.push(args.containerId);

        if (args.repository) {
          const target = args.tag
            ? `${args.repository}:${args.tag}`
            : args.repository;
          cmdArgs.push(target);
        }

        const output = await execDocker(cmdArgs);
        const imageId = output.trim();

        return {
          content: [
            {
              type: "text" as const,
              text: `Image created: ${imageId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
