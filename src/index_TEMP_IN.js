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

// 2. PARSE INITIAL DATA FUNCTION
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
    if (node.url === "chrome://bookmarks/") {
      node.title = "⭐️ [chrome://bookmarks/] (do not mod)";
    }

    if (node.children) {
      applyPostParsingRenaming(node.children);
    }
  });
  return sst;
}

// 3. RENAME NODES POST-PARSING
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

async function initializeAODMWithProcessedData(updatedArray, updatedDict) {
  bookmarkDict = updatedDict;

  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);

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

  setAODMData(bookmarkDict);
  setupAndPopulateJsTree(rootNodes);
}

// Formatting nodes for jsTree, ensuring all necessary properties are set for the AODM
function formatJsTreeNode(node) {
  const defaultState = { opened: false, selected: false };
  const formattedNode = {
    id: node.id,
    text: node.title || "Untitled",
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
  array.length = 0;
  for (let key in dict) delete dict[key];

  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArray(updatedArray);

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
// 4. SETUP JSTREE
// Setting up and populating the jsTree with the formatted bookmark data, using the AODM
function setupAndPopulateJsTree(aodmData) {
  // Convert dictionary to array format suitable for jsTree
  const aodmArray = Object.values(aodmData);

  $("#bookmarkTree").jstree({
    core: {
      data: aodmArray,
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

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", function () {
  manageAODM(); // Calling the new AODM master function in manageAODM.js

  // Test the imported data
  setTimeout(() => {
    setupAndPopulateJsTree(aodmDictionary);

    // Existing fetch and processing logic
    fetch("data/chrome_bookmarks_all.json")
      .then((response) => response.json())
      .then((data) => {
        const parsedData = parseInitialData(data.children);
        const cleanedData = cleanParsedData(parsedData);
        const renamedData = applyPostParsingRenaming(cleanedData);
        const bookmarkArray = [];
        const bookmarkDict = {};

        const { updatedArray, updatedDict } = updateArrayAndDict(
          bookmarkArray,
          bookmarkDict,
          renamedData
        );

        const pathToTestNode = findPathToNode(
          updatedArray,
          renamingTestFolderId
        );

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
        setupAndPopulateJsTree(rootNodes);
      })
      .catch((error) => console.error("Error loading JSON data:", error));
  }, 1000); // 1-second delay for illustration; adjust as needed
});

// 6. HELPER FUNCTIONS

// Find path to a node by its ID, used for opening folders in the jsTree
function findPathToNode(array, nodeId) {
  for (const node of array) {
    if (node.id === nodeId) {
      return [node];
    }
    if (node.children) {
      const path = findPathToNode(node.children, nodeId);
      if (path) {
        return [node, ...path];
      }
    }
  }
  return null;
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
      initializeAODM_old(data.children);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));
}

// Loading and processing bookmark data
async function loadAndProcessBookmarkData() {
  try {
    const response = await fetch("data/chrome_bookmarks_all.json");
    const data = await response.json();

    const parsedData = parseInitialData(data.children);
    const cleanedData = cleanParsedData(parsedData);
    const renamedData = applyPostParsingRenaming(cleanedData);

    const bookmarkArray = [];
    const bookmarkDict = {};

    const { updatedArray, updatedDict } = updateArrayAndDict(
      bookmarkArray,
      bookmarkDict,
      renamedData
    );

    await initializeAODMWithProcessedData(updatedArray, updatedDict);
  } catch (error) {
    console.error("Error fetching or processing JSON data:", error);
  }
}

// Initializing the jsTree with the AODM data
function initializeJsTree() {
  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);

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

  setupAndPopulateJsTree(rootNodes);
}

// Define initializeAODM_old function
function initializeAODM_old(data) {
  const parsedData = parseInitialData(data);
  const cleanedData = cleanParsedData(parsedData);
  const renamedData = applyPostParsingRenaming(cleanedData);

  const bookmarkArray = [];
  const bookmarkDict = {};

  const { updatedArray, updatedDict } = updateArrayAndDict(
    bookmarkArray,
    bookmarkDict,
    renamedData
  );

  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);

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

  setupAndPopulateJsTree(rootNodes);
}

// Setting the AODM data
function setAODMData(bookmarkDict) {
  // Placeholder for any logic needed to set the bookmarkDict
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", async function () {
  manageAODM();

  // Call the new function to load and process bookmark data
  await loadAndProcessBookmarkData();
  loadAODM_old();
});
