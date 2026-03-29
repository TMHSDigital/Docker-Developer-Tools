import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z
    .string()
    .min(1)
    .describe("Image to pull (e.g. 'nginx:alpine', 'ubuntu:22.04', 'ghcr.io/org/app:latest')"),
  platform: z
    .string()
    .optional()
    .describe("Platform to pull (e.g. 'linux/amd64', 'linux/arm64')"),
  allTags: z
    .boolean()
    .optional()
    .default(false)
    .describe("Pull all tagged images in the repository"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_pull",
    "Pull an image or repository from a registry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["pull"];

        if (args.platform) {
          cmdArgs.push("--platform", args.platform);
        }

        if (args.allTags) {
          cmdArgs.push("--all-tags");
        }

        cmdArgs.push(args.image);

        const output = await execDocker(cmdArgs, { timeout: 300_000 });

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
