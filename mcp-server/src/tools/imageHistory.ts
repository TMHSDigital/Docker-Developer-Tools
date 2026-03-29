import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image name or ID"),
  noTrunc: z.boolean().optional().default(false).describe("Don't truncate output"),
  format: z.string().optional().default("json").describe("Output format (default: json)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_imageHistory",
    "Show the layer history of a Docker image (commands, sizes, timestamps)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["history", "--format", args.format ?? "json"];
        if (args.noTrunc) cmdArgs.push("--no-trunc");
        cmdArgs.push(args.image);
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No history found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
