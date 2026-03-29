import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  images: z
    .array(z.string().min(1))
    .min(1)
    .describe("Image names or IDs to save (e.g. ['myapp:v1', 'myapp:v2'])"),
  output: z
    .string()
    .min(1)
    .describe("Output file path for the tar archive (e.g. './myapp-images.tar')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_save",
    "Save one or more images to a tar archive",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["save", "-o", args.output, ...args.images];

        await execDocker(cmdArgs, { timeout: 300_000 });

        return {
          content: [
            {
              type: "text" as const,
              text: `Saved ${args.images.join(", ")} to ${args.output}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
