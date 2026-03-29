import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  server: z.string().optional().describe("Registry server (default: Docker Hub)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_logout",
    "Log out from a Docker container registry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["logout"];
        if (args.server) cmdArgs.push(args.server);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "Logged out" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
