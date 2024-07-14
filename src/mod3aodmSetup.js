import { setNodeState, bmarksMainAO } from "./mod4aodmManage.js";
import { jsTreeSetup } from "./mod5jsTreeSetup.js";

let bmarksDictInitial = {}; // Global variable to store bookmark dictionary

export async function loadAndProcessBookmarkData() {
  try {
    const response = await fetch("data/chrome_bookmarks_all.json");
    const data = await response.json();

    const bmarksArrP2Parsed = bmarksProc2Parse(data.children);
    const bmarksArrP3Cleaned = bmarksProc3Clean(bmarksArrP2Parsed);
    const bmarksArrP4Renamed = bmarksProc4Rename(bmarksArrP3Cleaned);

    const bmarksArrayInitialEmpty = [];

    const { bmarksMainAO, bmarksMainDM } = updateArrayAndDict(
      bmarksArrayInitialEmpty,
      bmarksDictInitial, // Use global variable
      bmarksArrP4Renamed
    );

    // Log the initial state
    console.log("🟫 3a. Initial bmarksMainAO:", bmarksMainAO);

    // Confirm function call and check parameters
    console.log("Calling logNodeState with bmarksMainAO and nodeId '1'");
    logNodeState(bmarksMainAO, "1");

    setNodeState(bmarksMainAO, "1", "selected", true);

    console.log("🟫 3c. State of Bookmarks Bar node after selection:");
    logNodeState(bmarksMainAO, "1");

    // Check the result in the console
    console.log("🟫 3d. Updated bmarksMainAO after selection:", bmarksMainAO);

    await initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM);
  } catch (error) {
    console.error("Error fetching or processing JSON data:", error);
  }
}

// function updateArrayAndDictInit(array, dict, newBookmarkData) {
//   array.length = 0;
//   for (let key in dict) delete dict[key];

//   const bmarksMainAO = newBookmarkData.map((node) =>
//     bmarksProc1FormatForJsTree(node)
//   );
//   array.push(...bmarksMainAO);
//   const bmarksMainDM = generateDictionaryFromArray(bmarksMainAO);
//   return { bmarksMainAO, bmarksMainDM };
// }

function logNodeState(nodes, nodeId) {
  console.log("test");
  console.log(
    "🟫 3f. logNodeState called with nodes:",
    nodes,
    "and nodeId:",
    nodeId
  );
  console.log("🟫 3g. Type of nodeId:", typeof nodeId);

  if (!Array.isArray(nodes)) {
    console.error("Invalid nodes array:", nodes);
    return;
  }
  if (typeof nodeId !== "string") {
    console.error("Invalid nodeId:", nodeId);
    nodeId = String(nodeId); // Force nodeId to be a string
  }

  console.log("🟫 3h. Nodes array:", JSON.stringify(nodes, null, 2));

  let recursiveCount = 0;
  for (const node of nodes) {
    console.log("🟫 3i. Checking node:", node);
    console.log(
      `Checking node id: ${node.id} (type: ${typeof node.id}) against nodeId: ${nodeId} (type: ${typeof nodeId})`
    );
    if (node.id === nodeId) {
      console.log(`🟫 3j. State of node ${nodeId}:`, node.state);
      return;
    }
    if (node.children) {
      console.log(`🟫 3k. Node ${node.id} has children, traversing...`);
      logNodeState(node.children, nodeId);
      recursiveCount++;
      if (recursiveCount > 10) {
        console.error("Recursive call limit reached!");
        return;
      }
    }
  }
}

// Formatting nodes for jsTree, ensuring all necessary properties are set for the AODM
export function bmarksProc1FormatForJsTree(node) {
  const defaultState = { opened: false, selected: false, checked: false };
  const formattedNode = {
    id: node.id,
    text: node.title || "Untitled", // Use a default value if node.title is not defined
    textPrev: node.title || "Untitled",
    textCand: "", // Add textCand with an initial empty string
    textBmarkTitleCleaned: "", // Add textBmarkTitleCleaned with an initial empty string
    selectedPrev: false, // Add selectedPrev with an initial false value
    openedPrev: false, // Add openedPrev with an initial false value
    checkedPrev: false, // Add checkedPrev with an initial false value
    children: node.children
      .filter((child) => typeof child === "object" && child !== null)
      .map((child) => bmarksProc1FormatForJsTree(child)),
    state: node.state || defaultState,
    a_attr: node.url ? { href: node.url } : undefined,
    type: node.url ? "file" : "default",
  };
  return formattedNode;
}

// Parsing the initial data structure into a usable format, preparing it for integration into the AODM
export function bmarksProc2Parse(data) {
  return data.map((node) => {
    const children = node.children ? bmarksProc2Parse(node.children) : [];
    return {
      id: node.id,
      title: node.text || null,
      url: node.data ? node.data.url : undefined,
      children: children,
      textPrev: node.text || null,
      textCand: "", // Add textCand with an initial empty string
      textBmarkTitleCleaned: "", // Add textBmarkTitleCleaned with an initial empty string
      state: { opened: false, selected: false, checked: false },
      selectedPrev: false, // Add selectedPrev with an initial false value
      openedPrev: false, // Add openedPrev with an initial false value
      checkedPrev: false, // Add checkedPrev with an initial false value
    };
  });
}

// Cleaning the parsed data to ensure it has the correct properties for the AODM
export function bmarksProc3Clean(data) {
  return data.map((node) => {
    let title;

    // Ensure all nodes have a valid title
    if (node.title) {
      title = node.title;
    } else {
      title = node.url ? "Unnamed Bookmark" : "New Folder"; // Corrected here
    }

    return {
      ...node,
      title: title,
      textPrev: node.textPrev || title,
      textCand: "", // Add textCand with an initial empty string
      textBmarkTitleCleaned: "", // Add textBmarkTitleCleaned with an initial empty string
      state: node.state || { opened: false, selected: false, checked: false },
      children: node.children ? bmarksProc3Clean(node.children) : [],
      selectedPrev: node.selectedPrev || false, // Include selectedPrev
      openedPrev: node.openedPrev || false, // Include openedPrev
      checkedPrev: node.checkedPrev || false, // Include checkedPrev
    };
  });
}

// Applying post-parsing renaming to nodes for consistency in the AODM
export function bmarksProc4Rename(sst) {
  sst.forEach((node) => {
    // Standardize the name for the `chrome://bookmarks/` bookmark
    if (node.url === "chrome://bookmarks/") {
      node.title = "⭐️ [chrome://bookmarks/] (do not mod)";
    }

    // Apply other renaming rules as needed
    if (node.children) {
      bmarksProc4Rename(node.children);
    }
  });
  return sst;
}

async function initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM) {
  bmarksDictInitial = bmarksMainDM; // Use global variable
  jsTreeSetup(bmarksMainAO); // Ensure jsTree is set up with the processed data
}
