import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  rotate: z.boolean().optional().default(false).describe("Rotate the unlock key"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmUnlockKey",
    "Display or rotate the Swarm unlock key",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "unlock-key"];
        if (args.rotate) cmdArgs.push("--rotate");
        cmdArgs.push("-q");
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
