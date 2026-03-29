import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  input: z
    .string()
    .min(1)
    .describe("Path to the tar archive to load (e.g. './myapp-images.tar')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_load",
    "Load images from a tar archive",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["load", "-i", args.input];

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
