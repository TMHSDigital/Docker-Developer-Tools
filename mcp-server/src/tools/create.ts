import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image to create the container from (e.g. 'nginx:alpine')"),
  name: z
    .string()
    .optional()
    .describe("Assign a name to the container"),
  ports: z
    .array(z.string())
    .optional()
    .describe("Port mappings as 'host:container' (e.g. ['8080:80'])"),
  env: z
    .array(z.string())
    .optional()
    .describe("Environment variables as 'KEY=VALUE'"),
  volumes: z
    .array(z.string())
    .optional()
    .describe("Volume mounts as 'host:container' or 'name:container'"),
  network: z
    .string()
    .optional()
    .describe("Connect the container to a network"),
  command: z
    .array(z.string())
    .optional()
    .describe("Command and arguments to run in the container"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Container labels as 'key=value'"),
  restart: z
    .string()
    .optional()
    .describe("Restart policy (no, always, on-failure, unless-stopped)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_create",
    "Create a new container without starting it",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["create"];

        if (args.name) {
          cmdArgs.push("--name", args.name);
        }

        if (args.ports) {
          for (const p of args.ports) {
            cmdArgs.push("-p", p);
          }
        }

        if (args.env) {
          for (const e of args.env) {
            cmdArgs.push("-e", e);
          }
        }

        if (args.volumes) {
          for (const v of args.volumes) {
            cmdArgs.push("-v", v);
          }
        }

        if (args.network) {
          cmdArgs.push("--network", args.network);
        }

        if (args.labels) {
          for (const l of args.labels) {
            cmdArgs.push("--label", l);
          }
        }

        if (args.restart) {
          cmdArgs.push("--restart", args.restart);
        }

        cmdArgs.push(args.image);

        if (args.command) {
          cmdArgs.push(...args.command);
        }

        const output = await execDocker(cmdArgs);
        const containerId = output.trim();

        return {
          content: [
            {
              type: "text" as const,
              text: `Container created: ${containerId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
