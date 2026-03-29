import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Manifest list name (e.g. 'myregistry/myapp:latest')"),
  images: z
    .array(z.string())
    .min(1)
    .describe("Constituent image references to include in the manifest list"),
  amend: z
    .boolean()
    .optional()
    .default(false)
    .describe("Amend an existing manifest list instead of creating a new one"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_manifestCreate",
    "Create a local manifest list for multi-architecture Docker images",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["manifest", "create"];

        if (args.amend) {
          cmdArgs.push("--amend");
        }

        cmdArgs.push(args.name, ...args.images);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Created manifest list '${args.name}'` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
