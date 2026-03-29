import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Name for the new network"),
  driver: z
    .string()
    .optional()
    .describe("Network driver: 'bridge', 'overlay', 'macvlan', 'none' (default: 'bridge')"),
  subnet: z
    .string()
    .optional()
    .describe("Subnet in CIDR format (e.g. '172.28.0.0/16')"),
  gateway: z
    .string()
    .optional()
    .describe("Gateway for the subnet (e.g. '172.28.0.1')"),
  ipRange: z
    .string()
    .optional()
    .describe("Allocate container IPs from this range (e.g. '172.28.5.0/24')"),
  internal: z
    .boolean()
    .optional()
    .default(false)
    .describe("Restrict external access to the network"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Labels as 'key=value' strings"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_networkCreate",
    "Create a Docker network with optional driver, subnet, and labels",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["network", "create"];

        if (args.driver) {
          cmdArgs.push("--driver", args.driver);
        }

        if (args.subnet) {
          cmdArgs.push("--subnet", args.subnet);
        }

        if (args.gateway) {
          cmdArgs.push("--gateway", args.gateway);
        }

        if (args.ipRange) {
          cmdArgs.push("--ip-range", args.ipRange);
        }

        if (args.internal) {
          cmdArgs.push("--internal");
        }

        if (args.labels) {
          for (const l of args.labels) {
            cmdArgs.push("--label", l);
          }
        }

        cmdArgs.push(args.name);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: `Network created: ${output.trim()}` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
