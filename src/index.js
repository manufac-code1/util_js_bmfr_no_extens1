// 1. CONFIGURATION VARIABLES
import "./index.css";

// Configuration Variables
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = false;
const RenamingTestingFolderOpen = true;
const renamingTestFolderId = "33645"; // Replace with actual folder ID for testing

// 2. PARSE INITIAL DATA FUNCTION
// Parsing Functions

function cleanParsedData(data) {
  return data.map((node) => {
    let title;
    if (node.title) {
      title = node.title;
    } else if (node.url === "chrome://bookmarks/") {
      title = "⭐️ Chrome Bookmarks";
    } else {
      title = node.url ? "Unnamed Bookmark" : "Unnamed Folder";
    }

    return {
      ...node,
      title: title,
      state: node.state || { opened: false },
      children: node.children ? cleanParsedData(node.children) : [],
    };
  });
}

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

function applyPostParsingRenaming(sst) {
  sst.forEach((node) => {
    if (
      node.url === "chrome://bookmarks/" &&
      node.title === "NULL_NAME__NO_FIELD_DATA"
    ) {
      node.title = "⭐️ [chrome://bookmarks/]";
    }
    if (node.children) {
      applyPostParsingRenaming(node.children);
    }
  });
  return sst;
}

// 3. APPLY POST-PARSING RENAMING FUNCTION
// jsTree Initialization Functions
function initializeJsTree(bookmarkData) {
  console.log("SECTION 3a: Initializing jsTree with data:", bookmarkData);
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

// 4. INITIALIZE JSTREE FUNCTION
// Utility Functions
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

function formatJsTreeNode(node) {
  // console.log("SECTION 4e: Formatting node:", node);
  const defaultState = { opened: false, selected: false };
  const formattedNode = {
    id: node.id,
    text: node.title,
    children: node.children
      .filter((child) => typeof child === "object" && child !== null)
      .map((child) => formatJsTreeNode(child)),
    state: node.state || defaultState,
    a_attr: node.url ? { href: node.url } : undefined,
    type: node.url ? "file" : "default",
  };
  // console.log("SECTION 4f: Formatted node:", formattedNode);
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
  array.length = 0;
  for (let key in dict) delete dict[key];

  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArray(updatedArray);

  console.log("SECTION 4q: ", updatedArray);
  console.log("SECTION 4r: ", updatedDict);

  return { updatedArray, updatedDict };
}

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

// 5. DOMCONTENTLOADED EVENT LISTENER
// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function () {
  const data = {
    id: "0",
    text: "",
    data: {},
    children: [
      {
        id: "1",
        text: "Bookmarks Bar",
        data: {},
        children: [
          {
            id: "12055",
            text: "",
            data: {
              url: "chrome://bookmarks/",
            },
            children: [],
          },
          {
            id: "33630",
            text: "example_parent1_w_only_1_child",
            data: {},
            children: [
              {
                id: "33631",
                text: "example_parent2_w_only_1_child",
                data: {},
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  console.log("SECTION 5: Hardcoded data:", data);

  const parsedData = parseInitialData(data.children);
  console.log("SECTION 5a: Parsed data:", parsedData);

  const cleanedData = cleanParsedData(parsedData);
  console.log("SECTION 5b: Cleaned data:", cleanedData);

  const renamedData = applyPostParsingRenaming(cleanedData);
  console.log("SECTION 5c: Renamed data:", renamedData);

  const bookmarkArray = [];
  const bookmarkDict = {};

  const { updatedArray, updatedDict } = updateArrayAndDict(
    bookmarkArray,
    bookmarkDict,
    renamedData
  );

  console.log("SECTION 5d: Updated array:", updatedArray);
  console.log("SECTION 5e: Updated dictionary:", updatedDict);

  const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
  console.log("SECTION 5f: Path to test node:", pathToTestNode);

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
    "SECTION 5g: Root nodes before jsTree initialization:",
    rootNodes
  );
  initializeJsTree(rootNodes);

  // fetch("data/chrome_bookmarks_small.json")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log("SECTION 5d: Updated array:", updatedArray);
  //     console.log("SECTION 5e: Updated dictionary:", updatedDict);

  //     console.log("SECTION 5: Fetched data:", data);

  //     const parsedData = parseInitialData(data.children);
  //     console.log("SECTION 5a: Parsed data:", parsedData);

  //     const cleanedData = cleanParsedData(parsedData);
  //     console.log("SECTION 5b: Cleaned data:", cleanedData);

  //     const renamedData = applyPostParsingRenaming(cleanedData);
  //     console.log("SECTION 5c: Renamed data:", renamedData);

  //     const bookmarkArray = [];
  //     const bookmarkDict = {};

  //     const { updatedArray, updatedDict } = updateArrayAndDict(
  //       bookmarkArray,
  //       bookmarkDict,
  //       renamedData
  //     );

  //     const pathToTestNode = findPathToNode(updatedArray, renamingTestFolderId);
  //     console.log("SECTION 5f: Path to test node:", pathToTestNode);

  //     let rootNodes = updatedArray.map((node) => {
  //       if (node.id === "1") {
  //         return { ...node, state: { opened: BookmarksBarOpen } };
  //       } else if (node.id === "2") {
  //         return { ...node, state: { opened: OtherBookmarksOpen } };
  //       } else if (node.id === "3") {
  //         return { ...node, state: { opened: MobileBookmarksOpen } };
  //       }
  //       return node;
  //     });

  //     if (RenamingTestingFolderOpen && pathToTestNode) {
  //       rootNodes = markNodesAsOpened(rootNodes, pathToTestNode);
  //     }

  //     console.log(
  //       "SECTION 5g: Root nodes before jsTree initialization:",
  //       rootNodes
  //     );
  //     initializeJsTree(rootNodes);
  //   })
  //   .catch((error) => console.error("Error loading JSON data:", error));
});
