import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to remove"),
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("Force removal of a running container (uses SIGKILL)"),
  volumes: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remove anonymous volumes associated with the container"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_rm",
    "Remove a container (must be stopped unless force is true)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["rm"];

        if (args.force) {
          cmdArgs.push("--force");
        }

        if (args.volumes) {
          cmdArgs.push("--volumes");
        }

        cmdArgs.push(args.containerId);

        await execDocker(cmdArgs);

        return {
          content: [
            {
              type: "text" as const,
              text: `Container removed: ${args.containerId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
