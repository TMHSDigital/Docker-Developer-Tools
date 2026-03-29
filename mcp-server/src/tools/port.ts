import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z.string().min(1).describe("Container name or ID"),
  privatePort: z.number().optional().describe("Private port number to query"),
  protocol: z.enum(["tcp", "udp"]).optional().describe("Protocol (default: tcp)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_port",
    "List port mappings or a specific mapping for a container",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["port", args.containerId];
        if (args.privatePort !== undefined) {
          let portSpec = String(args.privatePort);
          if (args.protocol) portSpec += `/${args.protocol}`;
          cmdArgs.push(portSpec);
        }
        const output = await execDocker(cmdArgs);
        return { content: [{ type: "text" as const, text: output.trim() || "No port mappings found" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
