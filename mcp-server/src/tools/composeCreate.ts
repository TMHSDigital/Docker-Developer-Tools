import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  services: z.array(z.string()).optional().describe("Specific services to create (default: all)"),
  build: z.boolean().optional().default(false).describe("Build images before creating containers"),
  forceRecreate: z.boolean().optional().default(false).describe("Recreate containers even if unchanged"),
  pull: z.string().optional().describe("Pull policy: 'always', 'missing', 'never'"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeCreate",
    "Create Docker Compose service containers without starting them",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("create");
        if (args.build) cmdArgs.push("--build");
        if (args.forceRecreate) cmdArgs.push("--force-recreate");
        if (args.pull) cmdArgs.push("--pull", args.pull);
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs, { timeout: 300_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "Compose containers created" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
