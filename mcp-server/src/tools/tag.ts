import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  sourceImage: z
    .string()
    .min(1)
    .describe("Source image name or ID (e.g. 'myapp:latest', 'abc123')"),
  targetImage: z
    .string()
    .min(1)
    .describe("Target image name and tag (e.g. 'registry.example.com/myapp:v2.0')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_tag",
    "Create a tag that refers to a source image",
    inputSchema,
    async (args) => {
      try {
        await execDocker(["tag", args.sourceImage, args.targetImage]);

        return {
          content: [
            {
              type: "text" as const,
              text: `Tagged ${args.sourceImage} as ${args.targetImage}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
