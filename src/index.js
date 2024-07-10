// 1. CONFIGURATION VARIABLES
let currentSelectedNode = null; // Global variable to store selected node ID
let bmarksDictInitial = {}; // Global variable to store bookmark dictionary

// let jsTreeInstance;

// Import statements
import "./index.css";
import { folderRenameTest1 } from "./mod6FolderRenamer.js";
import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
  clearFolderTitlePrev,
} from "./mod8State.js";
import {
  bmarksProc1Parse,
  bmarksProc2Clean,
  bmarksProc3Rename,
} from "./mod2aodmSetup.js"; // Import the moved functions
import {
  jsTreeSetup,
  jsTreeSetup1Initial,
  jsTreeSetup2Populate,
  prepareJSTreeNodes,
} from "./mod4jsTreeSetup.js"; // Import setup functions
import {
  jsTreeSetup3EventHandlers,
  handleSelectionChange,
} from "./mod5jsTreeManage.js"; // Import management functions
import {
  updateArrayAndDict,
  findPathToNode,
  setAODMData,
} from "./mod3aodmManage.js";

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

async function initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM) {
  bmarksDictInitial = bmarksMainDM; // Assuming bmarksDictInitial is a global variable

  const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId);

  let bmarksArrJSTree1 = bmarksMainAO.map((node) => {
    if (node.id === "1") {
      return { ...node, state: { opened: BookmarksBarOpen } };
    } else if (node.id === "2") {
      return { ...node, state: { opened: OtherBookmarksOpen } };
    } else if (node.id === "3") {
      return { ...node, state: { opened: MobileBookmarksOpen } };
    }
    return node;
  });

  if (RenamingTestingFolderOpen && pathToTestNode) {
    bmarksArrJSTree1 = markNodesAsOpened(bmarksArrJSTree1, pathToTestNode);
  }

  setAODMData(bmarksDictInitial); // Ensure this is being called correctly
  jsTreeSetup(bmarksArrJSTree1); // Ensure jsTree is set up with the processed data
}

// Define loadAODM function
// function loadAODM() {
//   fetch("data/chrome_bookmarks_all.json")
//     .then((response) => response.json())
//     .then((data) => {
//       initializeAODM(data.children);
//     })
//     .catch((error) => console.error("Error fetching JSON data:", error));
// }

async function loadAndProcessBookmarkData() {
  try {
    const response = await fetch("data/chrome_bookmarks_all.json");
    const data = await response.json();

    const bmarksArrP1Parsed = bmarksProc1Parse(data.children);
    const bmarksArrP2Cleaned = bmarksProc2Clean(bmarksArrP1Parsed);
    const bmarksArrP3Renamed = bmarksProc3Rename(bmarksArrP2Cleaned);

    const bmarksObjFromJSON = [];
    const bmarksDictInitial = {};

    const { bmarksMainAO, bmarksMainDM } = updateArrayAndDict(
      bmarksObjFromJSON,
      bmarksDictInitial,
      bmarksArrP3Renamed
    );

    await initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM);
  } catch (error) {
    console.error("Error fetching or processing JSON data:", error);
  }
}

// Updated initializeJsTree function
function initializeJsTree() {
  const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId);
  const bmarksArrJSTree1 = prepareJSTreeNodes(bmarksMainAO, pathToTestNode);
  jsTreeSetup(bmarksArrJSTree1);
}

// Define initializeAODM function
function initializeAODM(data) {
  const bmarksArrP1Parsed = bmarksProc1Parse(data);
  const bmarksArrP2Cleaned = bmarksProc2Clean(bmarksArrP1Parsed);
  const bmarksArrP3Renamed = bmarksProc3Rename(bmarksArrP2Cleaned);

  const bmarksObjFromJSON = [];
  const bmarksDictInitial = {};

  const { bmarksMainAO, bmarksMainDM } = updateArrayAndDict(
    bmarksObjFromJSON,
    bmarksDictInitial,
    bmarksArrP3Renamed
  );

  const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId);
  const bmarksArrJSTree1 = prepareJSTreeNodes(bmarksMainAO, pathToTestNode);

  jsTreeSetup(bmarksArrJSTree1);
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", async function () {
  // Initiate DataPath2
  // manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  // loadAODM(); // Ensure this is being called
});
