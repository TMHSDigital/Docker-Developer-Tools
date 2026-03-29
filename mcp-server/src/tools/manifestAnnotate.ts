import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  name: z
    .string()
    .min(1)
    .describe("Manifest list name"),
  image: z
    .string()
    .min(1)
    .describe("Image reference within the manifest list to annotate"),
  os: z
    .string()
    .optional()
    .describe("Override OS (e.g. 'linux', 'windows')"),
  arch: z
    .string()
    .optional()
    .describe("Override architecture (e.g. 'amd64', 'arm64', 'arm')"),
  variant: z
    .string()
    .optional()
    .describe("Override variant (e.g. 'v7', 'v8')"),
  osFeatures: z
    .array(z.string())
    .optional()
    .describe("Override OS features"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_manifestAnnotate",
    "Add platform information to a manifest list entry",
    inputSchema,
    async (args) => {
      try {
        const cmdArgs = ["manifest", "annotate"];

        if (args.os) {
          cmdArgs.push("--os", args.os);
        }

        if (args.arch) {
          cmdArgs.push("--arch", args.arch);
        }

        if (args.variant) {
          cmdArgs.push("--variant", args.variant);
        }

        if (args.osFeatures) {
          for (const f of args.osFeatures) {
            cmdArgs.push("--os-features", f);
          }
        }

        cmdArgs.push(args.name, args.image);

        const output = await execDocker(cmdArgs);

        return {
          content: [
            { type: "text" as const, text: output.trim() || `Annotated '${args.image}' in manifest '${args.name}'` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
