// 1. CONFIGURATION VARIABLES
import parseInitialData from "./dataProc";

import "./index.css";

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

// 2. CLEAN PARSED DATA FUNCTION
function cleanParsedData(data) {
  console.log("INDEX 2a: cleanParsedData - Input data:", data);
  const cleanedData = data.map((node) => {
    console.log("Inspecting node:", node); // Additional logging to inspect node structure
    let title;

    // Ensure all nodes have a valid title
    if (node.title) {
      title = node.title;
    } else {
      title = node.url ? "Unnamed Bookmark" : "New Folder";
    }

    const cleanedChildren = node.children ? cleanParsedData(node.children) : []; // Clean children first

    const cleanedNode = {
      ...node,
      title: title, // Use the original title or the assigned one
      state: node.state || {
        opened: false,
      },
      children: cleanedChildren, // Assign the already cleaned children
    };
    console.log("INDEX 2b: cleanParsedData - Cleaned node:", cleanedNode);
    return cleanedNode;
  });
  console.log("INDEX 2c: cleanParsedData - Output data:", cleanedData);
  return cleanedData;
}

// Applying post-parsing renaming to nodes for consistency in the AODM
function applyPostParsingRenaming(nodes) {
  console.log("INDEX 3a: applyPostParsingRenaming - Input data:", nodes);

  const renamedNodes = nodes.map((node) => {
    if (node.url === "chrome://bookmarks/") {
      node.title = "⭐️ [chrome://bookmarks/] (do not mod)";
    }

    // Recursively rename children only if they exist
    if (node.children && Array.isArray(node.children)) {
      // Ensure it's an array before mapping
      node.children = applyPostParsingRenaming(node.children);
    }

    console.log("INDEX 3b: applyPostParsingRenaming - Renamed node:", node);
    return node; // Return the modified node for the mapping
  });

  console.log(
    "INDEX 3c: applyPostParsingRenaming - Output data:",
    renamedNodes
  );
  return renamedNodes; // Return the array of renamed nodes
}

// Setting up and populating the jsTree with the formatted bookmark data, using the AODM
function setupAndPopulateJsTree(bookmarkData) {
  console.log("SECTION 3a: Initializing jsTree with data:", bookmarkData);
  $("#bookmarkTree").jstree({
    core: {
      data: bookmarkData.map((node) => ({
        id: node.id,
        text: node.text, // Use node.text instead of node.title
        children: node.children,
      })),
      check_callback: true,
      themes: {
        name: "default-dark",
        dots: true,
        icons: true,
        url: "libs/themes/default-dark/style.css",
      },
    },
    types: {
      default: {
        icon: "jstree-folder",
      },
      file: {
        icon: "jstree-file",
      },
    },
    state: { key: "bookmarkTreeState" },
    plugins: ["state", "types", "search", "lazy"],
  });
}

// 4. INITIALIZE JSTREE
// Finding the path to a specific node by ID within the AODM
function findPathToNode(nodes, targetId, path = []) {
  for (const node of nodes) {
    const currentPath = [...path, node.id];
    if (node.id === targetId) {
      return currentPath;
    }
    if (node.children) {
      const result = findPathToNode(node.children, targetId, currentPath);
      if (result) {
        return result;
      }
    }
  }
  return null;
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
  console.log("Formatted node:", formattedNode); // Additional logging
  return formattedNode;
}

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
  console.log("Child nodes for parentId", parentId, ":", result); // Additional logging
  return result;
}

// Generating a dictionary from an array of nodes for quick lookups by ID, a key part of the AODM
function generateDictionaryFromArray(array) {
  const dict = {};
  array.forEach((node) => {
    dict[node.id] = node;
    if (node.children) {
      Object.assign(dict, generateDictionaryFromArray(node.children));
    }
  });
  console.log("Generated dictionary:", dict); // Additional logging
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
function updateArrayAndDict(array, dict, newBookmarkData) {
  array.length = 0;
  for (let key in dict) delete dict[key];

  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArray(updatedArray);

  console.log("SECTION 4q: Updated array:", updatedArray); // Additional logging
  console.log("SECTION 4r: Updated dictionary:", updatedDict); // Additional logging

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
// Handling the DOMContentLoaded event to initialize the jsTree
document.addEventListener("DOMContentLoaded", function () {
  function validateData(data) {
    // Add validation logic here to ensure nodes are structured correctly
    // Example: Ensure every node has an id and a title
    return data.map((node) => {
      if (!node.id) {
        node.id = `generated-id-${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!node.title) {
        node.title = node.url ? "Unnamed Bookmark" : "New Folder";
      }
      if (node.children) {
        node.children = validateData(node.children);
      }
      return node;
    });
  }

  fetch("data/chrome_bookmarks_small.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("SECTION 5: Fetched data:", data);

      const parsedData = parseInitialData(data.children);
      console.log("SECTION 5a: Parsed data:", parsedData);

      const validatedData = validateData(parsedData);
      console.log("SECTION 5b: Validated data:", validatedData);

      const cleanedData = cleanParsedData(validatedData);
      console.log("SECTION 5c: Cleaned data:", cleanedData);

      const renamedData = applyPostParsingRenaming(cleanedData);
      console.log("SECTION 5d: Renamed data:", renamedData);

      const bookmarkArray = [];
      const bookmarkDict = {};

      const { updatedArray, updatedDict } = updateArrayAndDict(
        bookmarkArray,
        bookmarkDict,
        renamedData
      );

      console.log("SECTION 5e: Updated array:", updatedArray);
      console.log("SECTION 5f: Updated dictionary:", updatedDict);

      const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
      console.log("SECTION 5g: Path to test node:", pathToTestNode);

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

      console.log(
        "SECTION 5h: Root nodes before jsTree initialization:",
        rootNodes
      );
      setupAndPopulateJsTree(rootNodes);
    })
    .catch((error) => console.error("Error loading JSON data:", error));
});
