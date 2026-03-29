import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResponse } from "../utils/docker-api.js";
import { spawn } from "node:child_process";

const inputSchema = {
  server: z.string().optional().describe("Registry server (default: Docker Hub)"),
  username: z.string().min(1).describe("Username"),
  password: z.string().min(1).describe("Password or access token"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_login",
    "Authenticate to a Docker container registry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["login", "-u", args.username, "--password-stdin"];
        if (args.server) cmdArgs.push(args.server);

        const output = await new Promise<string>((resolve, reject) => {
          const proc = spawn("docker", cmdArgs, { stdio: ["pipe", "pipe", "pipe"] });
          let stdout = "";
          let stderr = "";
          proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
          proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
          proc.on("error", reject);
          proc.on("close", (code) => {
            if (code === 0) resolve(stdout);
            else reject(new Error(stderr || `docker login exited with code ${code}`));
          });
          proc.stdin.write(args.password);
          proc.stdin.end();
        });

        return { content: [{ type: "text" as const, text: output.trim() || "Login Succeeded" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
