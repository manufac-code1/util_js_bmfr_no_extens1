// 1. CONFIGURATION VARIABLES

// Global variable to store selected node ID
let selectedNodeId = null;

// Global variable to store bookmark dictionary
let bookmarkDict = {};

// Import statements
import "./index.css";
import addEmojiToTitle from "./folderRenamer";
import { manageAODM, updatedArray } from "./manageAODM.js";

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

// At the top of index.js after the imports
// console.log(
//   "🟧Path 1, Top: AODM dictionary from module at import:",
//   aodmDictionary
// );
// console.log(
//   "🟫Path 1, Top: Updated array from module at import:",
//   updatedArray
// );

// 2. PARSE INITIAL DATA FUNCTION
// Parsing the initial data structure into a usable format, preparing it for integration into the AODM
function parseInitialData(data) {
  return data.map((node) => {
    const children = node.children ? parseInitialData(node.children) : [];
    return {
      id: node.id,
      title: node.text || null,
      url: node.data ? node.data.url : undefined,
      children: children,
    };
  });
}

// Cleaning the parsed data to ensure it has the correct properties for the AODM
function cleanParsedData(data) {
  return data.map((node) => {
    let title;

    // Ensure all nodes have a valid title
    if (node.title) {
      title = node.title;
    } else {
      title = node.url ? "Unnamed Bookmark" : "New Folder";
    }

    return {
      ...node,
      title: title,
      state: node.state || { opened: false },
      children: node.children ? cleanParsedData(node.children) : [],
    };
  });
}

// Applying post-parsing renaming to nodes for consistency in the AODM
function applyPostParsingRenaming(sst) {
  sst.forEach((node) => {
    // Standardize the name for the `chrome://bookmarks/` bookmark
    if (node.url === "chrome://bookmarks/") {
      node.title = "⭐️ [chrome://bookmarks/] (do not mod)";
    }

    // Apply other renaming rules as needed
    if (node.children) {
      applyPostParsingRenaming(node.children);
    }
  });
  return sst;
}

// 3. INITIALIZE AODM WITH PROCESSED DATA
async function initializeAODMWithProcessedData(updatedArray, updatedDict) {
  // Initialize the AODM using updatedArray and updatedDict
  console.log(
    "🟩 Initializing AODM with processed data:",
    updatedArray,
    updatedDict
  );
  bookmarkDict = updatedDict; // Assuming bookmarkDict is a global variable

  // Placeholder for any additional initialization logic needed
  console.log("🟩 AODM initialized with:", updatedArray, updatedDict);

  // Call setAODMData to set the bookmarkDict object
  setAODMData(bookmarkDict);
}

// Formatting nodes for jsTree, ensuring all necessary properties are set for the AODM
function formatJsTreeNode(node) {
  const defaultState = { opened: false, selected: false };
  const formattedNode = {
    id: node.id,
    text: node.title || "Untitled", // Use a default value if node.title is not defined
    children: node.children
      .filter((child) => typeof child === "object" && child !== null)
      .map((child) => formatJsTreeNode(child)),
    state: node.state || defaultState,
    a_attr: node.url ? { href: node.url } : undefined,
    type: node.url ? "file" : "default",
  };
  return formattedNode;
}

// Export the function
export { formatJsTreeNode };

// Getting child nodes of a specific parent node, used for hierarchical data traversal within the AODM
function getChildNodes(data, parentId) {
  const result = [];
  function findNodes(nodes) {
    for (const node of nodes) {
      if (node.id === parentId && node.children) {
        result.push(...node.children);
      } else if (node.children) {
        findNodes(node.children);
      }
    }
  }
  findNodes(data);
  return result;
}

// Generating a dictionary from an array of nodes for quick lookups by ID, a key part of the AODM
let generateDictionaryCounter = 0;

function generateDictionaryFromArray(array) {
  const dict = {};
  array.forEach((node) => {
    dict[node.id] = node;
    if (node.children) {
      Object.assign(dict, generateDictionaryFromArray(node.children));
    }
  });
  generateDictionaryCounter++;
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
function updateArrayAndDict(array, dict, newBookmarkData) {
  array.length = 0; // Clear the array
  for (let key in dict) delete dict[key]; // Clear the dictionary

  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray); // Update the array with new data
  const updatedDict = generateDictionaryFromArray(updatedArray); // Generate the dictionary from the updated array

  console.log(
    "Path 1 💧- updateArrayAndDict - Final updatedArray:",
    updatedArray
  );
  console.log(
    "Path 1 💧- updateArrayAndDict - Final updatedDict:",
    updatedDict
  );

  return { updatedArray, updatedDict };
}

// Marking nodes as opened along a specific path, used for expanding parts of the tree within the AODM
function markNodesAsOpened(nodes, path) {
  if (path.length === 0) {
    return nodes;
  }
  return nodes.map((node) => {
    if (node.id === path[0]) {
      return {
        ...node,
        state: { opened: true },
        children: node.children
          ? markNodesAsOpened(node.children, path.slice(1))
          : node.children,
      };
    }
    return node;
  });
}

// Setting the state of a specific node, such as marking it as opened or closed within the AODM
function setNodeState(nodes, nodeId, newState) {
  for (const node of nodes) {
    if (node.id === nodeId) {
      node.state = { opened: newState };
      if (newState && node.parent) {
        setNodeState(nodes, node.parent, true);
      }
      return;
    }
    if (node.children) {
      setNodeState(node.children, nodeId, newState);
    }
  }
}

// Finding the path to a specific node within the tree structure
function findPathToNode(nodes, nodeId) {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return [node.id];
    }
    if (node.children) {
      const path = findPathToNode(node.children, nodeId);
      if (path) {
        return [node.id, ...path];
      }
    }
  }
  return null;
}

// Define loadAODM_old function
function loadAODM_old() {
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("🟧 Fetched data:", data); // Confirm data being fetched
      initializeAODM_old(data.children);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));
}

async function loadAndProcessBookmarkData() {
  try {
    const response = await fetch("data/chrome_bookmarks_all.json");
    const data = await response.json();
    console.log("Fetched data:", data);

    const parsedData = parseInitialData(data.children);
    console.log("Parsed data:", parsedData);
    const cleanedData = cleanParsedData(parsedData);
    console.log("Cleaned data:", cleanedData);
    const renamedData = applyPostParsingRenaming(cleanedData);
    console.log("Renamed data:", renamedData);

    const bookmarkArray = [];
    const bookmarkDict = {};

    const { updatedArray, updatedDict } = updateArrayAndDict(
      bookmarkArray,
      bookmarkDict,
      renamedData
    );
    console.log("Updated array:", updatedArray);
    console.log("Updated dictionary:", updatedDict);

    await initializeAODMWithProcessedData(updatedArray, updatedDict);
  } catch (error) {
    console.error("Error fetching or processing JSON data:", error);
  }
}

// Define initializeAODM_old function
function initializeAODM_old(data) {
  console.log("🟨 Initializing AODM with data:", data);
  const parsedData = parseInitialData(data);
  console.log("🟨 Parsed data:", parsedData);
  const cleanedData = cleanParsedData(parsedData);
  console.log("🟨 Cleaned data:", cleanedData);
  const renamedData = applyPostParsingRenaming(cleanedData);
  console.log("🟨 Renamed data:", renamedData);

  const bookmarkArray = [];
  const bookmarkDict = {};

  const { updatedArray, updatedDict } = updateArrayAndDict(
    bookmarkArray,
    bookmarkDict,
    renamedData
  );
  console.log("🟨 Updated array:", updatedArray);
  console.log("🟨 Updated dictionary:", updatedDict);

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
  // Ensure setupAndPopulateJsTree is called with rootNodes
  setupAndPopulateJsTree(rootNodes);
}

function setAODMData(bookmarkDict) {
  // Set the bookmarkDict object
  // Placeholder for any logic needed to set the bookmarkDict
  console.log("🟩AODM Dictionary set:", bookmarkDict);
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", async function () {
  // console.log("🟧 DOMContentLoaded event fired"); // Confirm event is firing

  // Initiate DataPath2
  manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  loadAODM_old(); // Ensure this is being called
});
