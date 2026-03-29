import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  context: z
    .string()
    .min(1)
    .describe("Build context path (e.g. '.', './app', absolute path)"),
  tag: z
    .array(z.string())
    .optional()
    .describe("Name and optionally tag the image (e.g. ['myapp:latest', 'myapp:v1.0'])"),
  file: z
    .string()
    .optional()
    .describe("Path to Dockerfile (default: 'context/Dockerfile')"),
  buildArgs: z
    .array(z.string())
    .optional()
    .describe("Build-time variables as 'KEY=VALUE' (e.g. ['NODE_ENV=production'])"),
  target: z
    .string()
    .optional()
    .describe("Set the target build stage for multi-stage builds"),
  noCache: z
    .boolean()
    .optional()
    .default(false)
    .describe("Do not use cache when building the image"),
  pull: z
    .boolean()
    .optional()
    .default(false)
    .describe("Always pull a newer version of the base image"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Image labels as 'key=value'"),
  platform: z
    .string()
    .optional()
    .describe("Target platform (e.g. 'linux/amd64')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_build",
    "Build a Docker image from a Dockerfile and context directory",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["build"];

        if (args.tag) {
          for (const t of args.tag) {
            cmdArgs.push("-t", t);
          }
        }

        if (args.file) {
          cmdArgs.push("-f", args.file);
        }

        if (args.buildArgs) {
          for (const ba of args.buildArgs) {
            cmdArgs.push("--build-arg", ba);
          }
        }

        if (args.target) {
          cmdArgs.push("--target", args.target);
        }

        if (args.noCache) {
          cmdArgs.push("--no-cache");
        }

        if (args.pull) {
          cmdArgs.push("--pull");
        }

        if (args.labels) {
          for (const l of args.labels) {
            cmdArgs.push("--label", l);
          }
        }

        if (args.platform) {
          cmdArgs.push("--platform", args.platform);
        }

        cmdArgs.push(args.context);

        const output = await execDocker(cmdArgs, { timeout: 600_000 });

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
