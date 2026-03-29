import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  imageRef: z
    .string()
    .min(1)
    .describe("Image name, tag, or ID to inspect (e.g. 'nginx:alpine', 'sha256:abc123')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_inspectImage",
    "Get detailed image metadata including layers, environment variables, entrypoint, and labels",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker([
          "inspect",
          "--type",
          "image",
          args.imageRef,
        ]);

        const data = JSON.parse(output);

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
