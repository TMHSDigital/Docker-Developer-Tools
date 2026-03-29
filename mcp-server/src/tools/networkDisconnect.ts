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
    .describe("Container name or ID to disconnect"),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("Force disconnection"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_networkDisconnect",
    "Disconnect a container from a Docker network",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["network", "disconnect"];

        if (args.force) {
          cmdArgs.push("--force");
        }

        cmdArgs.push(args.network, args.container);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Container ${args.container} disconnected from ${args.network}` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
