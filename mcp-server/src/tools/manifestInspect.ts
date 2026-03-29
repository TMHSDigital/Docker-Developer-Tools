import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Manifest list or image name to inspect"),
  verbose: z
    .boolean()
    .optional()
    .default(false)
    .describe("Output additional info including layers and platform details"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_manifestInspect",
    "Display an image manifest or manifest list",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["manifest", "inspect"];

        if (args.verbose) {
          cmdArgs.push("--verbose");
        }

        cmdArgs.push(args.name);

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
