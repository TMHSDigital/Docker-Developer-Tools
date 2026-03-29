import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z.string().min(1).describe("Secret name"),
  file: z.string().min(1).describe("Path to the secret file"),
  labels: z.array(z.string()).optional().describe("Labels (e.g. ['env=production'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_secretCreate",
    "Create a Docker Swarm secret from a file",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["secret", "create"];
        if (args.labels) for (const l of args.labels) cmdArgs.push("--label", l);
        cmdArgs.push(args.name, args.file);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Secret '${args.name}' created` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
