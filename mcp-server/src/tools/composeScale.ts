import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  file: z.string().optional().describe("Path to compose file"),
  projectDir: z.string().optional().describe("Working directory for the compose project"),
  scales: z.array(z.string()).min(1).describe("Scale specifications (e.g. ['web=3', 'worker=2'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_composeScale",
    "Scale Docker Compose services to a specified number of replicas",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["compose"];
        if (args.file) cmdArgs.push("-f", args.file);
        if (args.projectDir) cmdArgs.push("--project-directory", args.projectDir);
        cmdArgs.push("up", "-d");
        for (const s of args.scales) {
          cmdArgs.push("--scale", s);
        }

        const output = await execDocker(cmdArgs, { timeout: 300_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Scaled services: ${args.scales.join(", ")}` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
