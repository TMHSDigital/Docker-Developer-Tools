import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  advertiseAddr: z.string().optional().describe("Advertised address (e.g. 'eth0:2377' or '192.168.1.1:2377')"),
  listenAddr: z.string().optional().describe("Listen address (default: 0.0.0.0:2377)"),
  forceNewCluster: z.boolean().optional().default(false).describe("Force create a new cluster from current state"),
  autolock: z.boolean().optional().default(false).describe("Enable manager autolocking (requires unlock key on restart)"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmInit",
    "Initialize a new Docker Swarm cluster on this node",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "init"];
        if (args.advertiseAddr) cmdArgs.push("--advertise-addr", args.advertiseAddr);
        if (args.listenAddr) cmdArgs.push("--listen-addr", args.listenAddr);
        if (args.forceNewCluster) cmdArgs.push("--force-new-cluster");
        if (args.autolock) cmdArgs.push("--autolock");
        const output = await execDocker(cmdArgs, { timeout: 60_000 });
        return { content: [{ type: "text" as const, text: output.trim() }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
