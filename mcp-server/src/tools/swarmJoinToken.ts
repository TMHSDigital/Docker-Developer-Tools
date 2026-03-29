import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  role: z.enum(["worker", "manager"]).describe("Token role: worker or manager"),
  rotate: z.boolean().optional().default(false).describe("Rotate the join token"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmJoinToken",
    "Display or rotate the join token for worker or manager nodes",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "join-token"];
        if (args.rotate) cmdArgs.push("--rotate");
        cmdArgs.push(args.role);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
