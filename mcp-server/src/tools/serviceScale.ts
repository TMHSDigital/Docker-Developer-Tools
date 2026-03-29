import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  scales: z.array(z.string()).min(1).describe("Scale specifications (e.g. ['web=5', 'api=3'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceScale",
    "Scale one or more Docker Swarm services to a target replica count",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["service", "scale", ...args.scales], { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
