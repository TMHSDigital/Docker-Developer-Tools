import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image to revoke trust for"),
  yes: z.boolean().optional().default(true).describe("Skip confirmation prompt"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_trustRevoke",
    "Revoke Docker Content Trust for an image",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["trust", "revoke"];
        if (args.yes) cmdArgs.push("--yes");
        cmdArgs.push(args.image);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Trust revoked for '${args.image}'` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
