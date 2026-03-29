import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  images: z
    .array(z.string().min(1))
    .min(1)
    .describe("Image names or IDs to remove (e.g. ['nginx:old', 'abc123'])"),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("Force removal of the image"),
  noPrune: z
    .boolean()
    .optional()
    .default(false)
    .describe("Do not delete untagged parent images"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_rmi",
    "Remove one or more images",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["rmi"];

        if (args.force) {
          cmdArgs.push("--force");
        }

        if (args.noPrune) {
          cmdArgs.push("--no-prune");
        }

        cmdArgs.push(...args.images);

        const output = await execDocker(cmdArgs);

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
