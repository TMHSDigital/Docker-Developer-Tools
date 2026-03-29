import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  network: z
    .string()
    .min(1)
    .describe("Network name or ID"),
  container: z
    .string()
    .min(1)
    .describe("Container name or ID to connect"),
  ip: z
    .string()
    .optional()
    .describe("IPv4 address to assign (e.g. '172.28.0.10')"),
  alias: z
    .array(z.string())
    .optional()
    .describe("Network-scoped aliases for the container"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_networkConnect",
    "Connect a container to a Docker network",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["network", "connect"];

        if (args.ip) {
          cmdArgs.push("--ip", args.ip);
        }

        if (args.alias) {
          for (const a of args.alias) {
            cmdArgs.push("--alias", a);
          }
        }

        cmdArgs.push(args.network, args.container);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Container ${args.container} connected to ${args.network}` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
