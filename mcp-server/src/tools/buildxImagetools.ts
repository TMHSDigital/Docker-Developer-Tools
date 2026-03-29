import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  action: z
    .enum(["inspect", "create"])
    .describe("Action: 'inspect' to view manifest info, 'create' to combine images into a manifest list"),
  sources: z
    .array(z.string())
    .min(1)
    .describe("Image references to inspect or combine"),
  tag: z
    .array(z.string())
    .optional()
    .describe("Tags for the created manifest list (only for 'create' action)"),
  dryRun: z
    .boolean()
    .optional()
    .default(false)
    .describe("Show what would be created without pushing (only for 'create' action)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxImagetools",
    "Inspect or create multi-platform manifest lists via buildx imagetools",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "imagetools", args.action];

        if (args.action === "create") {
          if (args.tag) {
            for (const t of args.tag) {
              cmdArgs.push("-t", t);
            }
          }

          if (args.dryRun) {
            cmdArgs.push("--dry-run");
          }
        }

        cmdArgs.push(...args.sources);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Imagetools operation completed" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
