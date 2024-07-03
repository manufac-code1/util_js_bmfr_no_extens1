// 1. CONFIGURATION VARIABLES

// Global variable to store selected node ID
let selectedNodeId = null;

import "./index.css";
import addEmojiToTitle from "./folderRenamer";

import { manageAODM, aodmDictionary, updatedArray } from "./manageAODM.js";

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

// At the top of index.js after the imports
console.log(
  "🟧Path 1, Top: AODM dictionary from module at import:",
  aodmDictionary
);
console.log(
  "🟫Path 1, Top: Updated array from module at import:",
  updatedArray
);

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

// 3. RENAME NODES POST-PARSING
// Setting up and populating the jsTree with the formatted bookmark data, using the AODM
function setupAndPopulateJsTree(aodmData) {
  // Convert dictionary to array format suitable for jsTree
  const aodmArray = Object.values(aodmData);

  // console.log("Path 1/2 - AODM Dictionary:", JSON.stringify(aodmData, null, 2));
  // console.log(
  //   "Path 1/2 - AODM Array for jsTree:",
  //   JSON.stringify(aodmArray, null, 2)
  // );

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
    console.log("Node selected:", selectedNode.text);
  });

  $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
    const deselectedNode = data.node;
    const updatedText = addEmojiToTitle(deselectedNode.text, false);
    jsTreeInstance.set_text(deselectedNode, updatedText);
    console.log("Node deselected:", deselectedNode.text);
  });
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

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
document.addEventListener("DOMContentLoaded", function () {
  manageAODM(); // Calling the new AODM master function in manageAODM.js

  // Test the imported data
  console.log(
    "Path 1, Main Loop - aodmDictionary from module:",
    aodmDictionary
  );
  console.log("Path 1, Main Loop - updatedArray from module:", updatedArray);

  setTimeout(() => {
    console.log(
      "Path 1, Main Loop - AODM dictionary from module after initialization:",
      aodmDictionary
    );
    console.log(
      "Path 1, Main Loop - Updated array from module after initialization:",
      updatedArray
    );

    // Continue with your existing code...
    // For example, calling setupAndPopulateJsTree or any other function
    // that requires the updatedArray and aodmDictionary

    // Existing fetch and processing logic
    fetch("data/chrome_bookmarks_all.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("01: fetch - data:", data);
        console.log("02: fetch - data.children:", data.children);

        const parsedData = parseInitialData(data.children);
        console.log("10: parseInitialData - parsedData:", parsedData);

        const cleanedData = cleanParsedData(parsedData);
        console.log("11: cleanParsedData - cleanedData:", cleanedData);

        const renamedData = applyPostParsingRenaming(cleanedData);
        console.log("12: applyPostParsingRenaming - renamedData:", renamedData);

        const bookmarkArray = [];
        const bookmarkDict = {};

        const { updatedArray, updatedDict } = updateArrayAndDict(
          bookmarkArray,
          bookmarkDict,
          renamedData
        );
        console.log(
          "13: updateArrayAndDict - updatedArray and updatedDict:",
          updatedArray,
          updatedDict
        );

        const pathToTestNode = findPathToNode(
          updatedArray,
          renamingTestFolderId
        );
        console.log("14: findPathToNode - pathToTestNode:", pathToTestNode);

        let rootNodes = updatedArray.map((node) => {
          console.log("15: map - rootNodes mapping:", rootNodes);
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
        console.log("16: before jsTree - rootNodes:", rootNodes);
        setupAndPopulateJsTree(rootNodes);
      })
      .catch((error) => console.error("Error loading JSON data:", error));
    setupAndPopulateJsTree(updatedArray);
  }, 1000); // 1-second delay for illustration; adjust as needed
});
