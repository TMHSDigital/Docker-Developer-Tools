import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .optional()
    .describe("Builder instance name"),
  driver: z
    .string()
    .optional()
    .describe("Builder driver (docker-container, kubernetes, remote)"),
  use: z
    .boolean()
    .optional()
    .default(false)
    .describe("Set the builder as current after creation"),
  platform: z
    .array(z.string())
    .optional()
    .describe("Fixed platforms for the builder (e.g. ['linux/amd64', 'linux/arm64'])"),
  buildkitdFlags: z
    .string()
    .optional()
    .describe("Flags for buildkitd daemon"),
  driverOpts: z
    .array(z.string())
    .optional()
    .describe("Driver-specific options as 'key=value'"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxCreate",
    "Create a new Docker buildx builder instance",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "create"];

        if (args.name) {
          cmdArgs.push("--name", args.name);
        }

        if (args.driver) {
          cmdArgs.push("--driver", args.driver);
        }

        if (args.use) {
          cmdArgs.push("--use");
        }

        if (args.platform) {
          cmdArgs.push("--platform", args.platform.join(","));
        }

        if (args.buildkitdFlags) {
          cmdArgs.push("--buildkitd-flags", args.buildkitdFlags);
        }

        if (args.driverOpts) {
          for (const opt of args.driverOpts) {
            cmdArgs.push("--driver-opt", opt);
          }
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Builder created" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
