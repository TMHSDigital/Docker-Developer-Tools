import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe("Filter volumes by key=value (e.g. 'driver=local', 'dangling=true', 'name=myvolume')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_listVolumes",
    "List Docker volumes with driver and mount information",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["volume", "ls", "--format", "json"];

        if (args.filter) {
          cmdArgs.push("--filter", args.filter);
        }

        const output = await execDocker(cmdArgs);

        if (!output.trim()) {
          return {
            content: [
              { type: "text" as const, text: "No volumes found." },
            ],
          };
        }

        const lines = output.trim().split("\n").filter(Boolean);
        const volumes = lines.map((line) => JSON.parse(line));

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(volumes, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
