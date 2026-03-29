import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z
    .string()
    .min(1)
    .describe("Image to push (e.g. 'myregistry.com/myapp:v1.0', 'ghcr.io/org/app:latest')"),
  allTags: z
    .boolean()
    .optional()
    .default(false)
    .describe("Push all tags of the image"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_push",
    "Push an image or repository to a registry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["push"];

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
