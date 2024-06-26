import "./index.css";

// Configuration Variables
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = true;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

document.addEventListener("DOMContentLoaded", function () {
  // Fetch bookmark data and initialize jsTree
  fetch("data/full_bookmarks.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched data:", data);

      // Ensure each node has a unique ID
      function ensureUniqueIds(
        nodes,
        parentId = null,
        depth = 0,
        logCount = { count: 0 }
      ) {
        return nodes
          .filter((node, index) => {
            if (logCount.count < 30) {
              // Limit logging to the first 30 nodes
              console.log(
                `Processing node: ${node.id}, parentId: ${parentId}, relative position: ${index}`
              );
              logCount.count++;
            }
            // Exclude all nodes with parent ID "1"
            if (parentId === "1") {
              console.log('Excluding node with parent ID "1":', node);
              return false;
            }
            return true;
          })
          .map((node, index) => {
            const uniqueId = parentId ? `${parentId}-${index}` : `${index}`;
            return {
              ...node,
              id: node.id || uniqueId,
              children: node.children
                ? ensureUniqueIds(node.children, uniqueId, depth + 1, logCount)
                : node.children,
              parent: parentId,
            };
          });
      }

      const dataWithUniqueIds = ensureUniqueIds(data);
      console.log("Data with unique IDs:", dataWithUniqueIds);

      // Filter out node 0 and directly use its children as root nodes
      let rootNodes = dataWithUniqueIds.find(
        (node) => node.id === "0"
      ).children;

      // Directly filter out the specific node
      rootNodes = rootNodes.filter(
        (node) => !(node.parentId === "1" && node.url === "chrome://bookmarks")
      );

      // Function to find the path to the target node
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

      const pathToTestNode = findPathToNode(rootNodes, renamingTestFolderId);
      console.log("Path to test node:", pathToTestNode);

      // Function to mark nodes along the path as opened
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

      // Function to set node state
      function setNodeState(nodes, nodeId, newState) {
        for (const node of nodes) {
          if (node.id === nodeId) {
            node.state = { opened: newState };
            if (newState && node.parent) {
              setNodeState(rootNodes, node.parent, true);
            }
            return;
          }
          if (node.children) {
            setNodeState(node.children, nodeId, newState);
          }
        }
      }

      // Apply default states first
      rootNodes = rootNodes.map((node) => {
        if (node.id === "1") {
          return { ...node, state: { opened: BookmarksBarOpen } };
        } else if (node.id === "2") {
          return { ...node, state: { opened: OtherBookmarksOpen } };
        } else if (node.id === "3") {
          return { ...node, state: { opened: MobileBookmarksOpen } };
        }
        return node;
      });

      // Apply specific test folder state if needed
      if (RenamingTestingFolderOpen && pathToTestNode) {
        rootNodes = markNodesAsOpened(rootNodes, pathToTestNode);
      }

      console.log("Root nodes before jsTree initialization:", rootNodes);

      // Initialize jsTree with the modified root nodes
      $("#bookmarkTree").jstree({
        core: {
          data: rootNodes.map((node) => formatJsTreeNode(node)),
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
            // Default type for folders
            icon: "jstree-folder",
          },
          file: {
            // Type for bookmarks
            icon: "jstree-file", // Use built-in jsTree file icon
          },
        },
        state: { key: "bookmarkTreeState" },
        plugins: ["state", "types", "search", "lazy"],
      });
    })
    .catch((error) => console.error("Error loading JSON data:", error));

  // Add event listeners for control bar buttons
  document.getElementById("backupBtn").addEventListener("click", function () {
    console.log("Backup button clicked");
  });

  document.getElementById("renameBtn").addEventListener("click", function () {
    console.log("Rename button clicked");
  });

  document.getElementById("undoBtn").addEventListener("click", function () {
    console.log("Undo button clicked");
  });
});

function formatJsTreeNode(node) {
  const formattedNode = {
    id: node.id,
    text: node.title || "NULL_NAME__NO_FIELD_DATA",
    children: Array.isArray(node.children)
      ? node.children.map((child) => formatJsTreeNode(child))
      : false,
    state: node.state,
    a_attr: node.url ? { href: node.url } : {},
    type: node.url ? "file" : "default", // Assign type based on presence of URL
  };
  return formattedNode;
}

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

function updateArrayAndDict(array, dict, newBookmarkData) {
  // Clear the existing array and dictionary
  array.length = 0;
  for (let key in dict) delete dict[key];

  // Process the new data
  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArray(updatedArray);

  // Log updated structures for inspection
  console.log(updatedArray);
  console.log(updatedDict);

  return { updatedArray, updatedDict };
}
