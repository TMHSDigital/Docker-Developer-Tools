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
import { register as registerRun } from "./tools/run.js";
import { register as registerCreate } from "./tools/create.js";
import { register as registerStart } from "./tools/start.js";
import { register as registerStop } from "./tools/stop.js";
import { register as registerRestart } from "./tools/restart.js";
import { register as registerKill } from "./tools/kill.js";
import { register as registerRm } from "./tools/rm.js";
import { register as registerPause } from "./tools/pause.js";
import { register as registerUnpause } from "./tools/unpause.js";
import { register as registerExec } from "./tools/exec.js";
import { register as registerPull } from "./tools/pull.js";
import { register as registerPush } from "./tools/push.js";
import { register as registerBuild } from "./tools/build.js";
import { register as registerTag } from "./tools/tag.js";
import { register as registerRmi } from "./tools/rmi.js";
import { register as registerCommit } from "./tools/commit.js";
import { register as registerSave } from "./tools/save.js";
import { register as registerLoad } from "./tools/load.js";
import { register as registerComposeUp } from "./tools/composeUp.js";
import { register as registerComposeDown } from "./tools/composeDown.js";
import { register as registerComposePs } from "./tools/composePs.js";
import { register as registerComposeLogs } from "./tools/composeLogs.js";
import { register as registerComposeBuild } from "./tools/composeBuild.js";
import { register as registerComposeRestart } from "./tools/composeRestart.js";
import { register as registerComposePull } from "./tools/composePull.js";
import { register as registerComposeExec } from "./tools/composeExec.js";
import { register as registerVolumeCreate } from "./tools/volumeCreate.js";
import { register as registerVolumeRm } from "./tools/volumeRm.js";
import { register as registerVolumeInspect } from "./tools/volumeInspect.js";
import { register as registerVolumePrune } from "./tools/volumePrune.js";
import { register as registerNetworkCreate } from "./tools/networkCreate.js";
import { register as registerNetworkRm } from "./tools/networkRm.js";
import { register as registerNetworkConnect } from "./tools/networkConnect.js";
import { register as registerNetworkDisconnect } from "./tools/networkDisconnect.js";
import { register as registerNetworkInspect } from "./tools/networkInspect.js";
import { register as registerNetworkPrune } from "./tools/networkPrune.js";
import { register as registerSystemPrune } from "./tools/systemPrune.js";
import { register as registerContainerPrune } from "./tools/containerPrune.js";
import { register as registerImagePrune } from "./tools/imagePrune.js";

const server = new McpServer({
  name: "docker-mcp",
  version: "0.5.0",
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
registerRun(server);
registerCreate(server);
registerStart(server);
registerStop(server);
registerRestart(server);
registerKill(server);
registerRm(server);
registerPause(server);
registerUnpause(server);
registerExec(server);
registerPull(server);
registerPush(server);
registerBuild(server);
registerTag(server);
registerRmi(server);
registerCommit(server);
registerSave(server);
registerLoad(server);
registerComposeUp(server);
registerComposeDown(server);
registerComposePs(server);
registerComposeLogs(server);
registerComposeBuild(server);
registerComposeRestart(server);
registerComposePull(server);
registerComposeExec(server);
registerVolumeCreate(server);
registerVolumeRm(server);
registerVolumeInspect(server);
registerVolumePrune(server);
registerNetworkCreate(server);
registerNetworkRm(server);
registerNetworkConnect(server);
registerNetworkDisconnect(server);
registerNetworkInspect(server);
registerNetworkPrune(server);
registerSystemPrune(server);
registerContainerPrune(server);
registerImagePrune(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
