import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  action: z.enum(["generate", "load"]).describe("Key action: generate a new key pair or load an existing key"),
  name: z.string().optional().describe("Key name (required for generate)"),
  keyFile: z.string().optional().describe("Path to the key file (required for load)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_trustKey",
    "Manage Docker Content Trust signing keys (generate or load)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["trust", "key", args.action];
        if (args.action === "generate") {
          if (!args.name) throw new Error("name is required for generate action");
          cmdArgs.push(args.name);
        } else {
          if (!args.keyFile) throw new Error("keyFile is required for load action");
          cmdArgs.push(args.keyFile);
        }
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || `Key ${args.action} completed` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
