let currentSelectedNode = null; // Global variable to store selected node ID

import "./index.css";
import { folderRenameTest1 } from "./mod7FolderRenamer.js";
import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
  clearFolderTitlePrev,
} from "./mod2State.js";
import {
  loadAndProcessBookmarkData,
  bmarksProc2Parse,
  bmarksProc3Clean,
  bmarksProc4Rename,
} from "./mod3aodmSetup.js"; // Import the moved functions and initializeAODMWithProcessedData
import {
  jsTreeSetup,
  jsTreeSetup1Initial,
  jsTreeSetup2Populate,
  prepareJSTreeNodes,
} from "./mod5jsTreeSetup.js"; // Import setup functions
import {
  jsTreeSetup4EventHandlers,
  handleSelectionChange,
} from "./mod6jsTreeManage.js"; // Import management functions
import {
  updateArrayAndDict,
  findPathToNode,
  setAODMData,
} from "./mod4aodmManage.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Initiate DataPath2
  // manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  // loadAODM(); // Ensure this is being called
});
