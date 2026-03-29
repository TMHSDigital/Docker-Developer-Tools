import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Builder instance name to set as current"),
  global: z
    .boolean()
    .optional()
    .default(false)
    .describe("Set builder as default for the current Docker context globally"),
  setDefault: z
    .boolean()
    .optional()
    .default(false)
    .describe("Set builder as default for the Docker context"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxUse",
    "Set the default Docker buildx builder instance",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "use"];

        if (args.global) {
          cmdArgs.push("--global");
        }

        if (args.setDefault) {
          cmdArgs.push("--default");
        }

        cmdArgs.push(args.name);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Now using builder '${args.name}'` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
