import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z.string().min(1).describe("Context name"),
  description: z.string().optional().describe("Description for the context"),
  dockerEndpoint: z.string().min(1).describe("Docker endpoint (e.g. 'ssh://user@host', 'tcp://host:2376')"),
  defaultStack: z.string().optional().describe("Default stack orchestrator"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_contextCreate",
    "Create a Docker context for connecting to remote Docker hosts",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["context", "create", args.name, "--docker", `host=${args.dockerEndpoint}`];
        if (args.description) cmdArgs.push("--description", args.description);
        if (args.defaultStack) cmdArgs.push("--default-stack-orchestrator", args.defaultStack);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Context '${args.name}' created` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
