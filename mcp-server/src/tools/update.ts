import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  containerId: z
    .string()
    .min(1)
    .describe("Container ID or name to update"),
  cpus: z
    .number()
    .optional()
    .describe("Number of CPUs (e.g. 1.5)"),
  memory: z
    .string()
    .optional()
    .describe("Memory limit (e.g. '512m', '1g')"),
  memorySwap: z
    .string()
    .optional()
    .describe("Total memory + swap limit (e.g. '1g', '-1' for unlimited)"),
  cpuShares: z
    .number()
    .optional()
    .describe("CPU shares (relative weight)"),
  restartPolicy: z
    .string()
    .optional()
    .describe(
      "Restart policy - 'no', 'always', 'unless-stopped', 'on-failure[:max-retries]'",
    ),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_update",
    "Update resource configuration of a running container (CPU, memory, restart policy)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["update"];

        if (args.cpus !== undefined) {
          cmdArgs.push("--cpus", String(args.cpus));
        }

        if (args.memory) {
          cmdArgs.push("--memory", args.memory);
        }

        if (args.memorySwap) {
          cmdArgs.push("--memory-swap", args.memorySwap);
        }

        if (args.cpuShares !== undefined) {
          cmdArgs.push("--cpu-shares", String(args.cpuShares));
        }

        if (args.restartPolicy) {
          cmdArgs.push("--restart", args.restartPolicy);
        }

        cmdArgs.push(args.containerId);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            {
              type: "text" as const,
              text: output.trim() || `Updated container ${args.containerId}`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
