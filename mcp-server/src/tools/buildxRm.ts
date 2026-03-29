import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Builder instance name to remove"),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("Force removal even if the builder is running"),
  allInactive: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove all inactive builders"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxRm",
    "Remove a Docker buildx builder instance",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "rm"];

        if (args.force) {
          cmdArgs.push("--force");
        }

        if (args.allInactive) {
          cmdArgs.push("--all-inactive");
        }

        cmdArgs.push(args.name);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Removed builder '${args.name}'` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
