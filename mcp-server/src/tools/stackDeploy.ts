import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z.string().min(1).describe("Stack name"),
  composeFile: z.string().min(1).describe("Path to the compose file"),
  prune: z.boolean().optional().default(false).describe("Prune services that are no longer referenced"),
  resolveImage: z.enum(["always", "changed", "never"]).optional().describe("Query the registry to resolve image digest and supported platforms"),
  withRegistryAuth: z.boolean().optional().default(false).describe("Send registry authentication details to Swarm agents"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_stackDeploy",
    "Deploy a new stack or update an existing stack from a compose file",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["stack", "deploy", "-c", args.composeFile];
        if (args.prune) cmdArgs.push("--prune");
        if (args.resolveImage) cmdArgs.push("--resolve-image", args.resolveImage);
        if (args.withRegistryAuth) cmdArgs.push("--with-registry-auth");
        cmdArgs.push(args.name);
        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Stack '${args.name}' deployed` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
