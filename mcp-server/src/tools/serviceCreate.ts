import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z.string().min(1).describe("Service name"),
  image: z.string().min(1).describe("Container image"),
  replicas: z.number().optional().describe("Number of replicas"),
  mode: z.enum(["replicated", "global"]).optional().describe("Service mode (default: replicated)"),
  ports: z.array(z.string()).optional().describe("Port mappings (e.g. ['8080:80', '443:443'])"),
  env: z.array(z.string()).optional().describe("Environment variables (e.g. ['KEY=value'])"),
  mounts: z.array(z.string()).optional().describe("Mounts (e.g. ['type=volume,source=data,target=/data'])"),
  networks: z.array(z.string()).optional().describe("Networks to attach"),
  constraints: z.array(z.string()).optional().describe("Placement constraints (e.g. ['node.role==manager'])"),
  labels: z.array(z.string()).optional().describe("Service labels (e.g. ['app=web'])"),
  command: z.array(z.string()).optional().describe("Command to run in the container"),
  restartPolicy: z.string().optional().describe("Restart condition (none, on-failure, any)"),
  limitCpu: z.number().optional().describe("CPU limit (e.g. 0.5)"),
  limitMemory: z.string().optional().describe("Memory limit (e.g. '512m')"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_serviceCreate",
    "Create a new Docker Swarm service (replicated or global)",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["service", "create", "--name", args.name];
        if (args.mode === "global") cmdArgs.push("--mode", "global");
        if (args.replicas !== undefined) cmdArgs.push("--replicas", String(args.replicas));
        if (args.ports) for (const p of args.ports) cmdArgs.push("-p", p);
        if (args.env) for (const e of args.env) cmdArgs.push("-e", e);
        if (args.mounts) for (const m of args.mounts) cmdArgs.push("--mount", m);
        if (args.networks) for (const n of args.networks) cmdArgs.push("--network", n);
        if (args.constraints) for (const c of args.constraints) cmdArgs.push("--constraint", c);
        if (args.labels) for (const l of args.labels) cmdArgs.push("--label", l);
        if (args.restartPolicy) cmdArgs.push("--restart-condition", args.restartPolicy);
        if (args.limitCpu !== undefined) cmdArgs.push("--limit-cpu", String(args.limitCpu));
        if (args.limitMemory) cmdArgs.push("--limit-memory", args.limitMemory);
        cmdArgs.push(args.image);
        if (args.command) cmdArgs.push(...args.command);
        const output = await execDocker(cmdArgs, { timeout: 120_000 });
        return { content: [{ type: "text" as const, text: output.trim() || `Service '${args.name}' created` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
