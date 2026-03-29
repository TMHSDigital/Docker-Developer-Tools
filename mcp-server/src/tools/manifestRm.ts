import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  names: z
    .array(z.string())
    .min(1)
    .describe("Manifest list names to remove"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_manifestRm",
    "Remove local manifest lists",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["manifest", "rm", ...args.names];

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Removed manifest list(s): ${args.names.join(", ")}` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
