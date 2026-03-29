import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  rotate: z.boolean().optional().default(false).describe("Rotate the cluster root CA"),
  certExpiry: z.string().optional().describe("Validity period for node certificates (e.g. '720h')"),
  detach: z.boolean().optional().default(false).describe("Return immediately instead of waiting for convergence"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmCa",
    "Display and optionally rotate the Swarm root CA certificate",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "ca"];
        if (args.rotate) cmdArgs.push("--rotate");
        if (args.certExpiry) cmdArgs.push("--cert-expiry", args.certExpiry);
        if (args.detach) cmdArgs.push("--detach");
        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
