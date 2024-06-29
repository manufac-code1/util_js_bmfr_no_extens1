// 1. CONFIGURATION VARIABLES
import "./index.css";
import { addEmojiToTitle } from "./folderRenamer";

// Configuration variables to control the state of various parts of the bookmarks tree
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = false;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

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
function setupAndPopulateJsTree(bookmarkData) {
  console.log("SECTION 3a: Initializing jsTree with data:", bookmarkData);

  $("#bookmarkTree")
    .jstree({
      core: {
        data: bookmarkData.map((node) => {
          console.log("Processing node:", node);
          return {
            id: node.id,
            text: addEmojiToTitle(node.text, node.state && node.state.selected),
            children: node.children
              ? node.children.map((child) => {
                  console.log("Processing child node:", child);
                  return {
                    id: child.id,
                    text: addEmojiToTitle(
                      child.text,
                      child.state && child.state.selected
                    ),
                    children: child.children || [],
                  };
                })
              : [],
          };
        }),
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
    })
    .on("select_node.jstree", handleJsTreeNodeSelection);
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
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
function updateArrayAndDict(array, dict, newBookmarkData) {
  array.length = 0;
  for (let key in dict) delete dict[key];

  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArray(updatedArray);

  console.log("SECTION 4q, updatedArray: ", updatedArray);
  // console.log("SECTION 4r: ", updatedDict);

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

// Function to handle jsTree node selection
function handleJsTreeNodeSelection(e, data) {
  const selectedNodeId = data.node.id;
  const selectedNodeText = data.node.text;
  console.log(
    `Node selected: ID = ${selectedNodeId}, Text = ${selectedNodeText}`
  );
}

// 5. DOMContentLoaded EVENT HANDLER (Main Processing Loop)
// Handling the DOMContentLoaded event to initialize the jsTree
document.addEventListener("DOMContentLoaded", function () {
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((data) => {
      // console.log("SECTION 5: Fetched data:", data);

      const parsedData = parseInitialData(data.children);
      // console.log("SECTION 5a: Parsed data:", parsedData);

      const cleanedData = cleanParsedData(parsedData);
      // console.log("SECTION 5b: Cleaned data:", cleanedData);

      const renamedData = applyPostParsingRenaming(cleanedData);
      // console.log("SECTION 5c: Renamed data:", renamedData);

      const bookmarkArray = [];
      const bookmarkDict = {};

      const { updatedArray, updatedDict } = updateArrayAndDict(
        bookmarkArray,
        bookmarkDict,
        renamedData
      );

      console.log("SECTION 5d: updatedArray:", updatedArray);
      // console.log("SECTION 5e: Updated dictionary:", updatedDict);

      const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
      // console.log("SECTION 5f: Path to test node:", pathToTestNode);

      let rootNodes = updatedArray.map((node) => {
        // console.log("DOMContentLoaded, rootNodes: ", rootNodes);
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

      // console.log(
      //   "SECTION 5g: Root nodes before jsTree initialization:",
      //   rootNodes
      // );
      setupAndPopulateJsTree(rootNodes);
    })
    .catch((error) => console.error("Error loading JSON data:", error));
});
