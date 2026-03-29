import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to inspect"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_inspectContainer",
    "Get detailed information about a container including config, networking, mounts, and state",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker([
          "inspect",
          "--type",
          "container",
          args.containerId,
        ]);

        const data = JSON.parse(output);

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
