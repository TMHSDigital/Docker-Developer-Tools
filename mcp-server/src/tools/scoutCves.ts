import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  image: z.string().min(1).describe("Image reference to scan (e.g. 'nginx:latest')"),
  onlyFixed: z.boolean().optional().default(false).describe("Only show CVEs with available fixes"),
  severities: z.string().optional().describe("Comma-separated severities to filter (e.g. 'critical,high')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_scoutCves",
    "List CVEs found in an image using Docker Scout (requires Docker Desktop)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["scout", "cves", args.image];
        if (args.onlyFixed) cmdArgs.push("--only-fixed");
        if (args.severities) cmdArgs.push("--only-severity", args.severities);

        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "No CVEs found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
