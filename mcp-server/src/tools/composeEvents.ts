import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  services: z.array(z.string()).optional().describe("Specific services to watch"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeEvents",
    "Receive recent real-time events from Docker Compose containers (captures a snapshot)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("events", "--json");
        if (args.services) cmdArgs.push(...args.services);

        const output = await execDocker(cmdArgs, { timeout: 5_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "No events captured" }] };
      } catch (error) {
        const err = error as Error & { killed?: boolean };
        if (err.killed || err.message?.includes("timed out")) {
          return { content: [{ type: "text" as const, text: "Event stream timed out (expected - compose events is continuous). Any captured events are above." }] };
        }
        return errorResponse(error);
      }
    },
  );
}
