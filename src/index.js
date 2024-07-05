// src/index.js

// 1. CONFIGURATION VARIABLES

// Global variable to store selected node ID
let currentSelectedNode = null;

// Global variable to store bookmark dictionary
let bmarksDictInitial = {};

// Import statements
import "./index.css";
import addEmojiToTitle from "./folderRenamer";
import {
  formatJsTreeNode,
  parseInitialData,
  cleanParsedData,
  applyPostParsingRenaming,
  getChildNodes,
  generateDictionaryFromArray,
  updateArrayAndDict,
  markNodesAsOpened,
  setNodeState,
  findPathToNode,
  setAODMData,
} from "./index_js_offload_1.js"; // Import the functions

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

// 3. RENAME NODES POST-PARSING
// Setting up and populating the jsTree with the formatted bookmark data, using the AODM
function setupAndPopulateJsTree(bookmarkData) {
  $("#bookmarkTree").jstree({
    core: {
      data: bookmarkData,
      check_callback: true,
      themes: {
        name: "default-dark",
        dots: true,
        icons: true,
        url: "libs/themes/default-dark/style.css",
      },
    },
    types: {
      default: { icon: "jstree-folder" },
      file: { icon: "jstree-file" },
    },
    state: { key: "bookmarkTreeState" },
    plugins: ["state", "types", "search", "lazy"],
  });

  const jsTreeInstance = $("#bookmarkTree").jstree(true);

  // Attach event handlers for node selection and deselection
  $("#bookmarkTree").on("select_node.jstree", function (e, data) {
    const selectedNode = data.node;
    const updatedText = addEmojiToTitle(selectedNode.text, true);
    jsTreeInstance.set_text(selectedNode, updatedText);
  });

  $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
    const deselectedNode = data.node;
    const updatedText = addEmojiToTitle(deselectedNode.text, false);
    jsTreeInstance.set_text(deselectedNode, updatedText);
  });
}

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
  setupAndPopulateJsTree(bmarksArrJSTree1); // Ensure jsTree is set up with the processed data
}

// Define loadAODM_old function
function loadAODM_old() {
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((data) => {
      initializeAODM_old(data.children);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));
}

async function loadAndProcessBookmarkData() {
  try {
    const response = await fetch("data/chrome_bookmarks_all.json");
    const data = await response.json();

    const bmarksArrP1Parsed = parseInitialData(data.children);
    const bmarksArrP2Cleaned = cleanParsedData(bmarksArrP1Parsed);
    const bmarksArrP3Renamed = applyPostParsingRenaming(bmarksArrP2Cleaned);

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

  setupAndPopulateJsTree(bmarksArrJSTree1);
}

// Define initializeAODM_old function
function initializeAODM_old(data) {
  const bmarksArrP1Parsed = parseInitialData(data);
  const bmarksArrP2Cleaned = cleanParsedData(bmarksArrP1Parsed);
  const bmarksArrP3Renamed = applyPostParsingRenaming(bmarksArrP2Cleaned);

  const bmarksObjFromJSON = [];
  const bmarksDictInitial = {};

  const { bmarksMainAO, bmarksMainDM } = updateArrayAndDict(
    bmarksObjFromJSON,
    bmarksDictInitial,
    bmarksArrP3Renamed
  );

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

  setupAndPopulateJsTree(bmarksArrJSTree1);
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", async function () {
  // Initiate DataPath2
  // manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  loadAODM_old(); // Ensure this is being called
});
