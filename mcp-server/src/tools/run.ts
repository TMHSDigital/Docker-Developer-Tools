import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image to run (e.g. 'nginx:alpine', 'ubuntu:22.04')"),
  name: z
    .string()
    .optional()
    .describe("Assign a name to the container"),
  ports: z
    .array(z.string())
    .optional()
    .describe("Port mappings as 'host:container' (e.g. ['8080:80', '443:443'])"),
  env: z
    .array(z.string())
    .optional()
    .describe("Environment variables as 'KEY=VALUE' (e.g. ['NODE_ENV=production'])"),
  volumes: z
    .array(z.string())
    .optional()
    .describe("Volume mounts as 'host:container' or 'name:container' (e.g. ['mydata:/data'])"),
  network: z
    .string()
    .optional()
    .describe("Connect the container to a network"),
  remove: z
    .boolean()
    .optional()
    .default(false)
    .describe("Automatically remove the container when it exits"),
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
    "docker_run",
    "Create and start a container from an image (always runs detached)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["run", "-d"];

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

        if (args.remove) {
          cmdArgs.push("--rm");
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
              text: `Container started: ${containerId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
