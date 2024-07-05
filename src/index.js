// src/index.js

// 1. CONFIGURATION VARIABLES

// Global variable to store selected node ID
let selectedNodeId = null;

// Global variable to store bookmark dictionary
let bookmarkDict = {};

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
  console.log(
    "🟧 Calling setupAndPopulateJsTree function with bookmarkData:",
    bookmarkData
  ); // Confirm function call

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
    console.log("🟧 Node selected:", selectedNode.text);
  });

  $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
    const deselectedNode = data.node;
    const updatedText = addEmojiToTitle(deselectedNode.text, false);
    jsTreeInstance.set_text(deselectedNode, updatedText);
    console.log("🟧 Node deselected:", deselectedNode.text);
  });
}

async function initializeAODMWithProcessedData(updatedArray, updatedDict) {
  console.log(
    "🟩 Initializing AODM with processed data:",
    updatedArray,
    updatedDict
  );
  bookmarkDict = updatedDict; // Assuming bookmarkDict is a global variable

  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
  console.log("🟨 Path to test node:", pathToTestNode);

  let rootNodes = updatedArray.map((node) => {
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
    rootNodes = markNodesAsOpened(rootNodes, pathToTestNode);
  }

  console.log("🟨 Root Nodes before jsTree setup:", rootNodes);

  setAODMData(bookmarkDict); // Ensure this is being called correctly
  setupAndPopulateJsTree(rootNodes); // Ensure jsTree is set up with the processed data
}

// Define loadAODM_old function
function loadAODM_old() {
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((data) => {
      // console.log("🟧 Fetched data:", data); // Confirm data being fetched
      initializeAODM_old(data.children);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));
}

async function loadAndProcessBookmarkData() {
  try {
    const response = await fetch("data/chrome_bookmarks_all.json");
    const data = await response.json();
    // console.log("Fetched data:", data);

    const parsedData = parseInitialData(data.children);
    // console.log("Parsed data:", parsedData);
    const cleanedData = cleanParsedData(parsedData);
    // console.log("Cleaned data:", cleanedData);
    const renamedData = applyPostParsingRenaming(cleanedData);
    // console.log("Renamed data:", renamedData);

    const bookmarkArray = [];
    const bookmarkDict = {};
    //
    const { updatedArray, updatedDict } = updateArrayAndDict(
      bookmarkArray,
      bookmarkDict,
      renamedData
    );
    // console.log("Updated array:", updatedArray);
    // console.log("Updated dictionary:", updatedDict);

    await initializeAODMWithProcessedData(updatedArray, updatedDict);
  } catch (error) {
    console.error("Error fetching or processing JSON data:", error);
  }
}

// Updated initializeJsTree function with additional console log
function initializeJsTree() {
  console.log("🟧 Calling initializeJsTree function"); // Confirm function call
  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
  console.log("🟧 Path to test node:", pathToTestNode);

  let rootNodes = updatedArray.map((node) => {
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
    rootNodes = markNodesAsOpened(rootNodes, pathToTestNode);
  }

  console.log("🟧 Root Nodes before jsTree setup:", rootNodes);
  setupAndPopulateJsTree(rootNodes);
}

// Define initializeAODM_old function
function initializeAODM_old(data) {
  // console.log("🟨 Initializing AODM with data:", data);
  const parsedData = parseInitialData(data);
  // console.log("🟨 Parsed data:", parsedData);
  const cleanedData = cleanParsedData(parsedData);
  // console.log("🟨 Cleaned data:", cleanedData);
  const renamedData = applyPostParsingRenaming(cleanedData);
  // console.log("🟨 Renamed data:", renamedData);

  const bookmarkArray = [];
  const bookmarkDict = {};

  const { updatedArray, updatedDict } = updateArrayAndDict(
    bookmarkArray,
    bookmarkDict,
    renamedData
  );
  // console.log("🟨 Updated array:", updatedArray);
  // console.log("🟨 Updated dictionary:", updatedDict);

  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
  // console.log("🟨 Path to test node:", pathToTestNode);

  let rootNodes = updatedArray.map((node) => {
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
    rootNodes = markNodesAsOpened(rootNodes, pathToTestNode);
  }

  // console.log("🟨 Root Nodes before jsTree setup:", rootNodes);
  // Ensure setupAndPopulateJsTree is called with rootNodes
  setupAndPopulateJsTree(rootNodes);
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", async function () {
  // console.log("🟧 DOMContentLoaded event fired"); // Confirm event is firing

  // Initiate DataPath2
  // manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  loadAODM_old(); // Ensure this is being called
});
