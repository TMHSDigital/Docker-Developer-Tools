#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { register as registerListContainers } from "./tools/listContainers.js";
import { register as registerInspectContainer } from "./tools/inspectContainer.js";
import { register as registerContainerLogs } from "./tools/containerLogs.js";
import { register as registerListImages } from "./tools/listImages.js";
import { register as registerInspectImage } from "./tools/inspectImage.js";
import { register as registerListVolumes } from "./tools/listVolumes.js";
import { register as registerListNetworks } from "./tools/listNetworks.js";
import { register as registerSystemInfo } from "./tools/systemInfo.js";
import { register as registerDiskUsage } from "./tools/diskUsage.js";
import { register as registerSearchHub } from "./tools/searchHub.js";

const server = new McpServer({
  name: "docker-mcp",
  version: "0.1.0",
});

registerListContainers(server);
registerInspectContainer(server);
registerContainerLogs(server);
registerListImages(server);
registerInspectImage(server);
registerListVolumes(server);
registerListNetworks(server);
registerSystemInfo(server);
registerDiskUsage(server);
registerSearchHub(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
