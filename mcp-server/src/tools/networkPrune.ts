import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe("Filter networks to prune (e.g. 'until=24h', 'label=temp')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_networkPrune",
    "Remove all unused Docker networks (always non-interactive)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["network", "prune", "-f"];

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || "No unused networks to prune" },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
