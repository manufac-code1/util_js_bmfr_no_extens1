// 1. CONFIGURATION VARIABLES
let currentSelectedNode = null; // Global variable to store selected node ID
let bmarksDictInitial = {}; // Global variable to store bookmark dictionary

// Import statements
import "./index.css";
import {
  formatJsTreeNode,
  bmarksProc1Parse,
  bmarksProc2Clean,
  bmarksProc3Rename,
  getChildNodes,
  generateDictionaryFromArray,
  updateArrayAndDict,
  markNodesAsOpened,
  setNodeState,
  findPathToNode,
  setAODMData,
} from "./index_offload.js"; // Import the functions
// import addEmojiToTitle from "./folderRenamer";
import { renameChildFolders } from "./folderRenamer.js";
import { jsTreeSetupAndPopulate } from "./jsTreeSetup.js";
import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setOriginalTexts,
  getOriginalTexts,
} from "./state.js";

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID to open it

// 2. Set up and populating the jsTree with the formatted bookmark data, using the AODM
let previousSelectedNode = null;
let originalTexts = {};

// function jsTreeSetupAndPopulate(bookmarkData) {
//   console.log("Setting up jsTree with data:", bookmarkData); // Log initial data

//   $("#bookmarkTree").jstree({
//     core: {
//       data: bookmarkData,
//       check_callback: true,
//       themes: {
//         name: "default-dark",
//         dots: true,
//         icons: true,
//         url: "libs/themes/default-dark/style.css",
//       },
//     },
//     types: {
//       default: { icon: "jstree-folder" },
//       file: { icon: "jstree-file" },
//     },
//     state: { key: "bookmarkTreeState" },
//     plugins: ["state", "types", "search", "lazy"],
//   });

//   const jsTreeInstance = $("#bookmarkTree").jstree(true);

//   // Clear any existing event listeners to avoid duplication
//   $("#bookmarkTree").off("select_node.jstree");
//   $("#bookmarkTree").off("deselect_node.jstree");

//   // Attach event handlers for node selection and deselection
//   $("#bookmarkTree").on("select_node.jstree", function (e, data) {
//     if (isInitializing) {
//       console.log("Skipping renaming during initialization.");
//       return;
//     }

//     const selectedNode = data.node;
//     console.log("Node selected:", selectedNode); // Log selected node

//     // Store original text if it's not already stored
//     if (!originalTexts[selectedNode.id]) {
//       originalTexts[selectedNode.id] = selectedNode.text;
//     }

//     // Use jsTree command to get children of the selected node
//     const childrenNodes = jsTreeInstance
//       .get_children_dom(selectedNode)
//       .toArray(); // Convert to array
//     console.log("Children nodes:", childrenNodes); // Log children nodes

//     // Ensure childrenNodes is an array
//     if (childrenNodes && childrenNodes.length > 0) {
//       const selectedNodeWithChildren = {
//         ...selectedNode,
//         children: childrenNodes.map((child) => jsTreeInstance.get_node(child)),
//       };

//       // Rename child folders
//       renameChildFolders(selectedNodeWithChildren, true, "candidateNewName");
//     } else {
//       console.log("No child nodes found for the selected node.");
//     }

//     // Update the previously selected node
//     previousSelectedNode = selectedNode;
//   });

//   $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
//     const deselectedNode = data.node;
//     console.log("Node deselected:", deselectedNode); // Log deselected node

//     // Use jsTree command to get children of the deselected node
//     const childrenNodes = jsTreeInstance
//       .get_children_dom(deselectedNode)
//       .toArray(); // Convert to array
//     console.log("Children nodes:", childrenNodes); // Log children nodes

//     // Ensure childrenNodes is an array
//     if (childrenNodes && childrenNodes.length > 0) {
//       const deselectedNodeWithChildren = {
//         ...deselectedNode,
//         children: childrenNodes.map((child) => jsTreeInstance.get_node(child)),
//       };

//       // Restore original names for child nodes
//       renameChildFolders(deselectedNodeWithChildren, false, "");
//     } else {
//       console.log("No child nodes found for the deselected node.");
//     }

//     // Clear previously selected node if it is the same as deselected node
//     if (previousSelectedNode && previousSelectedNode.id === deselectedNode.id) {
//       previousSelectedNode = null;
//     }
//   });

//   // Set isInitializing to false after initial setup
//   setTimeout(() => {
//     isInitializing = false;
//     console.log("Initialization complete.");
//   }, 0);
// }

async function initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM) {
  bmarksDictInitial = bmarksMainDM; // Assuming bmarksDictInitial is a global variable

  const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId);

  let bmarksArrJSTree1 = bmarksMainAO.map((bmarksNode) => {
    if (bmarksNode.id === "1") {
      return { ...bmarksNode, state: { opened: BookmarksBarOpen } };
    } else if (bmarksNode.id === "2") {
      return { ...bmarksNode, state: { opened: OtherBookmarksOpen } };
    } else if (bmarksNode.id === "3") {
      return { ...bmarksNode, state: { opened: MobileBookmarksOpen } };
    }
    return bmarksNode;
  });

  if (RenamingTestingFolderOpen && pathToTestNode) {
    bmarksArrJSTree1 = markNodesAsOpened(bmarksArrJSTree1, pathToTestNode);
  }

  setAODMData(bmarksDictInitial); // Ensure this is being called correctly
  jsTreeSetupAndPopulate(bmarksArrJSTree1); // Ensure jsTree is set up with the processed data
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

// Function to prepare the bmarksArrJSTree1 array based on bmarksMainAO
function prepareJSTreeNodes(bmarksMainAO, pathToTestNode) {
  let bmarksArrJSTree1 = bmarksMainAO.map((bmarkNode) => {
    if (bmarkNode.id === "1") {
      return { ...bmarkNode, state: { opened: BookmarksBarOpen } };
    } else if (bmarkNode.id === "2") {
      return { ...bmarkNode, state: { opened: OtherBookmarksOpen } };
    } else if (bmarkNode.id === "3") {
      return { ...bmarkNode, state: { opened: MobileBookmarksOpen } };
    }
    return bmarkNode;
  });

  if (RenamingTestingFolderOpen && pathToTestNode) {
    bmarksArrJSTree1 = markNodesAsOpened(bmarksArrJSTree1, pathToTestNode);
  }

  return bmarksArrJSTree1;
}

// Updated initializeJsTree function
function initializeJsTree() {
  const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId);
  const bmarksArrJSTree1 = prepareJSTreeNodes(bmarksMainAO, pathToTestNode);
  // jsTreeSetupAndPopulate(bmarksArrJSTree1);
}

// Define initializeAODM_old function
function initializeAODM_old(data) {
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

  // jsTreeSetupAndPopulate(bmarksArrJSTree1);
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", async function () {
  // Initiate DataPath2
  // manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  // loadAODM_old(); // Ensure this is being called
});

export { originalTexts, previousSelectedNode, renameChildFolders };
