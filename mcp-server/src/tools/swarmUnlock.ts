import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResponse } from "../utils/docker-api.js";
import { spawn } from "node:child_process";

const inputSchema = {
  key: z.string().min(1).describe("Unlock key for the swarm manager"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_swarmUnlock",
    "Unlock a locked Docker Swarm manager node",
    inputSchema,
    async (args) => {
      try {
        const output = await new Promise<string>((resolve, reject) => {
          const proc = spawn("docker", ["swarm", "unlock"], { stdio: ["pipe", "pipe", "pipe"] });
          let stdout = "";
          let stderr = "";
          proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
          proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
          proc.on("error", reject);
          proc.on("close", (code) => {
            if (code === 0) resolve(stdout);
            else reject(new Error(stderr || `docker swarm unlock exited with code ${code}`));
          });
          proc.stdin.write(args.key + "\n");
          proc.stdin.end();
        });
        return { content: [{ type: "text" as const, text: output.trim() || "Swarm unlocked" }] };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
