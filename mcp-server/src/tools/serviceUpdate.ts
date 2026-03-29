import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  service: z.string().min(1).describe("Service name or ID"),
  image: z.string().optional().describe("Update the service image"),
  replicas: z.number().optional().describe("Update replica count"),
  env: z.array(z.string()).optional().describe("Add or update environment variables"),
  labels: z.array(z.string()).optional().describe("Add or update labels"),
  force: z.boolean().optional().default(false).describe("Force update even if no changes"),
  limitCpu: z.number().optional().describe("CPU limit"),
  limitMemory: z.string().optional().describe("Memory limit"),
  args: z.array(z.string()).optional().describe("Additional raw CLI flags for full flexibility"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceUpdate",
    "Update a Docker Swarm service (image, replicas, resources, env)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "update"];
        if (args.image) cmdArgs.push("--image", args.image);
        if (args.replicas !== undefined) cmdArgs.push("--replicas", String(args.replicas));
        if (args.env) for (const e of args.env) cmdArgs.push("--env-add", e);
        if (args.labels) for (const l of args.labels) cmdArgs.push("--label-add", l);
        if (args.force) cmdArgs.push("--force");
        if (args.limitCpu !== undefined) cmdArgs.push("--limit-cpu", String(args.limitCpu));
        if (args.limitMemory) cmdArgs.push("--limit-memory", args.limitMemory);
        if (args.args) cmdArgs.push(...args.args);
        cmdArgs.push(args.service);
        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Service '${args.service}' updated` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
