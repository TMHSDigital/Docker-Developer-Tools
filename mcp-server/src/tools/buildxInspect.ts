import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .optional()
    .describe("Builder instance name (defaults to current builder)"),
  bootstrap: z
    .boolean()
    .optional()
    .default(false)
    .describe("Ensure the builder is running before inspecting"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxInspect",
    "Inspect a Docker buildx builder instance",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "inspect"];

        if (args.bootstrap) {
          cmdArgs.push("--bootstrap");
        }

        if (args.name) {
          cmdArgs.push(args.name);
        }

        const output = await execDocker(cmdArgs, { timeout: 60_000 });

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
