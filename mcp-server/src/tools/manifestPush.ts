import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Manifest list name to push"),
  purge: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove the local manifest list after push"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_manifestPush",
    "Push a manifest list to a registry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["manifest", "push"];

        if (args.purge) {
          cmdArgs.push("--purge");
        }

        cmdArgs.push(args.name);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Pushed manifest list '${args.name}'` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
