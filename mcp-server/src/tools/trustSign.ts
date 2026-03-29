import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image to sign (e.g. 'registry.example.com/myimage:latest')"),
  local: z.boolean().optional().default(false).describe("Sign a locally tagged image"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_trustSign",
    "Sign an image for Docker Content Trust",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["trust", "sign"];
        if (args.local) cmdArgs.push("--local");
        cmdArgs.push(args.image);
        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Image '${args.image}' signed` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
