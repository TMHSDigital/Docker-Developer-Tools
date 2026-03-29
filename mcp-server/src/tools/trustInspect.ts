import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image name (e.g. 'docker.io/library/nginx')"),
  pretty: z.boolean().optional().default(false).describe("Print in human-readable format"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_trustInspect",
    "Inspect Docker Content Trust data for an image (signers, signatures, keys)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["trust", "inspect"];
        if (args.pretty) cmdArgs.push("--pretty");
        cmdArgs.push(args.image);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
