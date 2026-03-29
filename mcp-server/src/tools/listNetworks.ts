import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe("Filter networks by key=value (e.g. 'driver=bridge', 'scope=local', 'name=mynet')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_listNetworks",
    "List Docker networks with driver and scope information",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["network", "ls", "--format", "json", "--no-trunc"];

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        if (!output.trim()) {
          return {
            content: [
              { type: "text" as const, text: "No networks found." },
            ],
          };
        }

        const lines = output.trim().split("\n").filter(Boolean);
        const networks = lines.map((line) => JSON.parse(line));

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(networks, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
