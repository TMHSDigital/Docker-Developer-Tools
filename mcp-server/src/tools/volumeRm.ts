import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  volumes: z
    .array(z.string())
    .min(1)
    .describe("Volume names to remove"),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("Force removal of volumes in use"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_volumeRm",
    "Remove one or more Docker volumes",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["volume", "rm"];

        if (args.force) {
          cmdArgs.push("--force");
        }

        cmdArgs.push(...args.volumes);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Volumes removed" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
