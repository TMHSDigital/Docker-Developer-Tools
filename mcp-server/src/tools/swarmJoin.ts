import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  token: z.string().min(1).describe("Join token (worker or manager)"),
  remoteAddrs: z.string().min(1).describe("Address of an existing manager node (e.g. '192.168.1.1:2377')"),
  advertiseAddr: z.string().optional().describe("Advertised address for this node"),
  listenAddr: z.string().optional().describe("Listen address for this node"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmJoin",
    "Join an existing Docker Swarm as a worker or manager node",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["swarm", "join", "--token", args.token];
        if (args.advertiseAddr) cmdArgs.push("--advertise-addr", args.advertiseAddr);
        if (args.listenAddr) cmdArgs.push("--listen-addr", args.listenAddr);
        cmdArgs.push(args.remoteAddrs);
        const output = await execDocker(cmdArgs, { timeout: 60_000 });
        return { content: [{ type: "text" as const, text: output.trim() || "Successfully joined the swarm" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
