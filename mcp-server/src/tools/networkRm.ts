import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  networks: z
    .array(z.string())
    .min(1)
    .describe("Network names or IDs to remove"),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("Force removal even if containers are connected"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_networkRm",
    "Remove one or more Docker networks",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["network", "rm"];

        if (args.force) {
          cmdArgs.push("--force");
        }

        cmdArgs.push(...args.networks);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "Networks removed" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
