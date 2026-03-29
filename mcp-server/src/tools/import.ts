import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  source: z.string().min(1).describe("Source file path, URL, or '-' for stdin"),
  repository: z.string().optional().describe("Repository name for the imported image"),
  tag: z.string().optional().describe("Tag for the imported image"),
  message: z.string().optional().describe("Commit message for the imported image"),
  changes: z.array(z.string()).optional().describe("Dockerfile instructions to apply (e.g. ['CMD /bin/bash', 'ENV FOO=bar'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_import",
    "Import a tarball to create a Docker filesystem image",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["import"];
        if (args.message) cmdArgs.push("--message", args.message);
        if (args.changes) {
          for (const c of args.changes) cmdArgs.push("--change", c);
        }
        cmdArgs.push(args.source);
        if (args.repository) {
          let ref = args.repository;
          if (args.tag) ref += `:${args.tag}`;
          cmdArgs.push(ref);
        }
        const output = await execDocker(cmdArgs, { timeout: 300_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "Image imported" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
