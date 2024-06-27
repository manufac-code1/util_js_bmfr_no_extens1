import "./index.css";

// Configuration Variables
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = true;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

document.addEventListener("DOMContentLoaded", function () {
  // Fetch bookmark data and initialize jsTree
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched data:", data);

      // Function to parse the bookmarks into a consistent format
      function parseBookmarks(nodes) {
        return nodes.map((node) => {
          const title = node.text || "NULL_NAME__NO_FIELD_DATA";
          const children = node.children ? parseBookmarks(node.children) : [];
          return {
            id: node.id,
            title: title,
            url: node.data ? node.data.url : undefined,
            children: children,
          };
        });
      }

      // Parse the data into a hierarchical structure
      const parsedData = parseBookmarks(data.children);
      console.log("Parsed data:", parsedData);

      // Function to initialize jsTree with the parsed bookmark data
      function initializeJsTree(bookmarkData) {
        $("#bookmarkTree").jstree({
          core: {
            data: bookmarkData.map((node) => formatJsTreeNode(node)),
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

      // Function to format nodes for jsTree
      function formatJsTreeNode(node) {
        return {
          id: node.id,
          text: node.title,
          children: node.children.map((child) => formatJsTreeNode(child)),
          state: node.state,
          a_attr: node.url ? { href: node.url } : {},
          type: node.url ? "file" : "default",
        };
      }

      // Function to find the path to a specific node by its ID
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

      // Find the path to the test folder node
      const pathToTestNode = findPathToNode(parsedData, renamingTestFolderId);
      console.log("Path to test node:", pathToTestNode);

      // Function to mark nodes along a given path as opened
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

      // Function to set the state of a specific node
      function setNodeState(nodes, nodeId, newState) {
        for (const node of nodes) {
          if (node.id === nodeId) {
            node.state = { opened: newState };
            if (newState && node.parent) {
              setNodeState(parsedData, node.parent, true);
            }
            return;
          }
          if (node.children) {
            setNodeState(node.children, nodeId, newState);
          }
        }
      }

      // Apply default states to the root nodes
      let rootNodes = parsedData.map((node) => {
        if (node.id === "1") {
          return { ...node, state: { opened: BookmarksBarOpen } };
        } else if (node.id === "2") {
          return { ...node, state: { opened: OtherBookmarksOpen } };
        } else if (node.id === "3") {
          return { ...node, state: { opened: MobileBookmarksOpen } };
        }
        return node;
      });

      // Mark nodes as opened if the test folder state is enabled
      if (RenamingTestingFolderOpen && pathToTestNode) {
        rootNodes = markNodesAsOpened(rootNodes, pathToTestNode);
      }

      console.log("Root nodes before jsTree initialization:", rootNodes);
      // Initialize jsTree with the modified root nodes
      initializeJsTree(rootNodes);
    })
    .catch((error) => console.error("Error loading JSON data:", error));
});

// Function to get child nodes by parent ID
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

// Function to generate a dictionary from an array of nodes
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

// Function to update an array and dictionary with new bookmark data
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
