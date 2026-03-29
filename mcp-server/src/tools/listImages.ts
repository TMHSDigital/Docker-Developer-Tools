import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  execDocker,
  parseJsonLines,
  errorResponse,
} from "../utils/docker-api.js";

const inputSchema = {
  all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include intermediate images (default: only top-level)"),
  filter: z
    .string()
    .optional()
    .describe(
      "Filter images by key=value (e.g. 'dangling=true', 'reference=nginx', 'label=maintainer=me')",
    ),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_listImages",
    "List local Docker images with tags, sizes, and creation dates",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["images", "--format", "json", "--no-trunc"];

        if (args.all) {
          cmdArgs.push("-a");
        }

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        if (!output.trim()) {
          return {
            content: [
              { type: "text" as const, text: "No images found." },
            ],
          };
        }

        const images = parseJsonLines(output);

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(images, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
