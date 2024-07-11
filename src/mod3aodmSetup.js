import {
  updateArrayAndDict,
  findPathToNode,
  setAODMData,
  markNodesAsOpened,
} from "./mod4aodmManage.js";
import { jsTreeSetup } from "./mod5jsTreeSetup.js";

let bmarksDictInitial = {}; // Global variable to store bookmark dictionary

async function initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM) {
  bmarksDictInitial = bmarksMainDM; // Use global variable
  // console.log("AODM (bmarksMainAO):", bmarksMainAO);
  // console.log("AODM Dictionary Map (bmarksMainDM):", bmarksMainDM);

  // const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId); // Find the path to the specific node

  setAODMData(bmarksDictInitial); // Ensure this is being called correctly
  jsTreeSetup(bmarksMainAO); // Ensure jsTree is set up with the processed data
}

// Define initializeAODM function
// function initializeAODM(data) {
//   // const bmarksArrP1InitFormat = bmarksProc1FormatForJsTree(data);
//   // const bmarksArrP2Parsed = bmarksProc2Parse(bmarksArrP1InitFormat);
//   // const bmarksArrP3Cleaned = bmarksProc3Clean(bmarksArrP2Parsed);
//   // const bmarksArrP4Renamed = bmarksProc4Rename(bmarksArrP3Cleaned);
//   // const bmarksArrayInitialEmpty = [];
//   // const { bmarksMainAO, bmarksMainDM } = updateArrayAndDict(
//   //   bmarksArrayInitialEmpty,
//   //   bmarksDictInitial, // Use global variable
//   //   bmarksArrP3Renamed
//   // );
//   // const pathToTestNode = findPathToNode(bmarksMainAO, renamingTestFolderId);
//   // const bmarksArrJSTree1 = prepareJSTreeNodes(bmarksMainAO, pathToTestNode);
//   // jsTreeSetup(bmarksArrJSTree1);
// }

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

    await initializeAODMWithProcessedData(bmarksMainAO, bmarksMainDM);
  } catch (error) {
    console.error("Error fetching or processing JSON data:", error);
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
      state: { opened: false, selected: false, checked: false },
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
      title = node.url ? "Unnamed Bookmark" : "New Folder";
    }

    return {
      ...node,
      title: title,
      textPrev: node.textPrev || title,
      textCand: "", // Add textCand with an initial empty string
      state: node.state || { opened: false },
      children: node.children ? bmarksProc3Clean(node.children) : [],
      isSelected: node.isSelected || false,
      isSelectedPrev: node.isSelectedPrev || false,
      isChecked: node.isChecked || false, // Include isChecked
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
