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
    .describe("Name and optionally tag the image (e.g. ['myapp:latest'])"),
  file: z
    .string()
    .optional()
    .describe("Path to Dockerfile (default: 'context/Dockerfile')"),
  platform: z
    .array(z.string())
    .optional()
    .describe("Target platforms (e.g. ['linux/amd64', 'linux/arm64'])"),
  builder: z
    .string()
    .optional()
    .describe("Builder instance to use"),
  buildArgs: z
    .array(z.string())
    .optional()
    .describe("Build-time variables as 'KEY=VALUE'"),
  target: z
    .string()
    .optional()
    .describe("Target build stage for multi-stage builds"),
  noCache: z
    .boolean()
    .optional()
    .default(false)
    .describe("Do not use cache when building"),
  pull: z
    .boolean()
    .optional()
    .default(false)
    .describe("Always pull newer base images"),
  push: z
    .boolean()
    .optional()
    .default(false)
    .describe("Push the image after building"),
  load: z
    .boolean()
    .optional()
    .default(false)
    .describe("Load the single-platform result into docker images"),
  cacheFrom: z
    .array(z.string())
    .optional()
    .describe("External cache sources (e.g. ['type=registry,ref=myapp:cache'])"),
  cacheTo: z
    .array(z.string())
    .optional()
    .describe("Cache export destinations (e.g. ['type=registry,ref=myapp:cache'])"),
  provenance: z
    .boolean()
    .optional()
    .describe("Generate provenance attestation"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Image labels as 'key=value'"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_buildxBuild",
    "Build Docker images with buildx for multi-platform support, cache export, and provenance",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["buildx", "build"];

        if (args.builder) {
          cmdArgs.push("--builder", args.builder);
        }

        if (args.tag) {
          for (const t of args.tag) {
            cmdArgs.push("-t", t);
          }
        }

        if (args.file) {
          cmdArgs.push("-f", args.file);
        }

        if (args.platform) {
          cmdArgs.push("--platform", args.platform.join(","));
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

        if (args.push) {
          cmdArgs.push("--push");
        }

        if (args.load) {
          cmdArgs.push("--load");
        }

        if (args.cacheFrom) {
          for (const cf of args.cacheFrom) {
            cmdArgs.push("--cache-from", cf);
          }
        }

        if (args.cacheTo) {
          for (const ct of args.cacheTo) {
            cmdArgs.push("--cache-to", ct);
          }
        }

        if (args.provenance !== undefined) {
          cmdArgs.push(`--provenance=${args.provenance}`);
        }

        if (args.labels) {
          for (const l of args.labels) {
            cmdArgs.push("--label", l);
          }
        }

        cmdArgs.push(args.context);

        const output = await execDocker(cmdArgs, { timeout: 600_000 });

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Build completed successfully" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
