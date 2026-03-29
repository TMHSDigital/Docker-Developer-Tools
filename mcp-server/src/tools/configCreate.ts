import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResponse } from "../utils/docker-api.js";
import { spawn } from "node:child_process";

const inputSchema = {
  name: z.string().min(1).describe("Config name"),
  file: z.string().optional().describe("Path to the config file (omit if providing data)"),
  data: z.string().optional().describe("Inline config value (piped via stdin)"),
  labels: z.array(z.string()).optional().describe("Labels (e.g. ['env=production'])"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_configCreate",
    "Create a Docker Swarm config from a file or inline data",
    inputSchema,
    async (args) => {
      try {
        if (!args.file && !args.data) {
          return errorResponse(new Error("Either 'file' or 'data' must be provided"));
        }

        const cmdArgs = ["config", "create"];
        if (args.labels) for (const l of args.labels) cmdArgs.push("--label", l);
        cmdArgs.push(args.name, args.file ?? "-");

        const output = await new Promise<string>((resolve, reject) => {
          const proc = spawn("docker", cmdArgs, { stdio: ["pipe", "pipe", "pipe"] });
          let stdout = "";
          let stderr = "";
          proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
          proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
          proc.on("error", reject);
          proc.on("close", (code) => {
            if (code === 0) resolve(stdout);
            else reject(new Error(stderr || `docker config create exited with code ${code}`));
          });
          if (args.data) {
            proc.stdin.write(args.data);
          }
          proc.stdin.end();
        });

        return { content: [{ type: "text" as const, text: output.trim() || `Config '${args.name}' created` }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
