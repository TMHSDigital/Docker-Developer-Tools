import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Name for the new volume"),
  driver: z
    .string()
    .optional()
    .describe("Volume driver to use (default: 'local')"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Labels as 'key=value' strings"),
  driverOpts: z
    .array(z.string())
    .optional()
    .describe("Driver-specific options as 'key=value' strings"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_volumeCreate",
    "Create a named Docker volume with optional driver and labels",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["volume", "create"];

        if (args.driver) {
          cmdArgs.push("--driver", args.driver);
        }

        if (args.labels) {
          for (const l of args.labels) {
            cmdArgs.push("--label", l);
          }
        }

        if (args.driverOpts) {
          for (const o of args.driverOpts) {
            cmdArgs.push("--opt", o);
          }
        }

        cmdArgs.push(args.name);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: `Volume created: ${output.trim()}` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
