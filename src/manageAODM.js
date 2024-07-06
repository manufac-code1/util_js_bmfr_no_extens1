let bmarksMainAO = [];
let bmarksDictProcessed_new = {};
import { formatJsTreeNode } from "./index.js";
import { processAODMData_TEST } from "./manageAODM.js";

function loadAODM() {
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((bmarksObjFromJSON_new) => {
      // console.log("•01: loadAODM - bmarksObjFromJSON_new:", bmarksObjFromJSON_new);
      initializeAODM(bmarksObjFromJSON_new.children);
    })
    .catch((error) => console.error("• Error fetching JSON data:", error));
}

function initializeAODM(bmarksObjFromJSON_new) {
  // console.log("•02: initializeAODM - bmarksObjFromJSON_new.children:", bmarksObjFromJSON_new);
  // console.log("•03: Array.isArray - bmarksObjFromJSON_new:", Array.isArray(bmarksObjFromJSON_new));

  const bmarksArrP1Parsed_new = parseInitialDataNEW(bmarksObjFromJSON_new);
  // console.log("•10: parseInitialDataNEW - bmarksArrP1Parsed_new:", bmarksArrP1Parsed_new);

  const bmarksArrP2Cleaned_new = cleanParsedDataNEW(bmarksArrP1Parsed_new);
  // console.log("•11: cleanParsedDataNEW - bmarksArrP2Cleaned_new:", bmarksArrP2Cleaned_new);

  const bmarksArrP3Renamed_new = applyPostParsingRenamingNEW(
    bmarksArrP2Cleaned_new
  );
  // console.log(
  //   "•12: applyPostParsingRenamingNEW - bmarksArrP3Renamed_new:",
  //   bmarksArrP3Renamed_new
  // );

  const updatedDict = generateDictionaryFromArrayNEW(bmarksArrP3Renamed_new);
  // console.log(
  //   "•13: generateDictionaryFromArrayNEW - updatedDict:",
  //   updatedDict
  // );

  // Debugging updatedDict
  // if (!updatedDict || Object.keys(updatedDict).length === 0) {
  //   console.log("😬•13a: updatedDict is empty or undefined:", updatedDict);
  // } else {
  //   console.log("😬•13b: updatedDict has keys:", Object.keys(updatedDict));
  // }

  bmarksDictProcessed_new = updatedDict; // Save the dictionary for export
  // console.log("⭕️•13c: bmarksDictProcessed_new after assignment:", bmarksDictProcessed_new);

  const { bmarksMainAO: newArray, bmarksMainDM_new } = updateArrayAndDictNEW(
    [],
    updatedDict,
    bmarksArrP3Renamed_new
  );
  bmarksMainAO = newArray; // Save the updated array for export
  // console.log(
  //   "•14: updateArrayAndDictNEW - bmarksMainAO and bmarksMainDM_new:",
  //   bmarksMainAO,
  //   bmarksMainDM_new
  // );

  // Log the final values before export
  // console.log("🟪•15: Final bmarksDictProcessed_new before export:", bmarksDictProcessed_new);
  // console.log("🟦•16: Final bmarksMainAO before export:", bmarksMainAO);

  // Additional processing can be added here
}

// 2. PARSE INITIAL DATA FUNCTION
function parseInitialDataNEW(data) {
  return data.map((node) => {
    const children = node.children ? parseInitialDataNEW(node.children) : [];
    return {
      id: node.id,
      title: node.text || null,
      url: node.data ? node.data.url : undefined,
      children: children,
    };
  });
}

// Cleaning the parsed data to ensure it has the correct properties for the AODM
function cleanParsedDataNEW(data) {
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
      children: node.children ? cleanParsedDataNEW(node.children) : [],
    };
  });
}

// Applying post-parsing renaming to nodes for consistency in the AODM
function applyPostParsingRenamingNEW(sst) {
  sst.forEach((node) => {
    if (node.url === "chrome://bookmarks/") {
      node.title = "⭐️ [chrome://bookmarks/] (do not mod)";
    }

    if (node.children) {
      applyPostParsingRenamingNEW(node.children);
    }
  });
  return sst;
}

// Generating a dictionary from an array of nodes for quick lookups by ID, a key part of the AODM
function generateDictionaryFromArrayNEW(array) {
  const dict = {};
  array.forEach((node) => {
    dict[node.id] = node;
    if (node.children) {
      Object.assign(dict, generateDictionaryFromArrayNEW(node.children));
    }
  });
  // console.log("Path 2 - generateDictionaryFromArrayNEW - dict:", dict); // Commented out console log
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
function updateArrayAndDictNEW(array, dict, newBookmarkData) {
  array.length = 0;
  for (let key in dict) delete dict[key];

  const bmarksMainAO = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...bmarksMainAO);
  const updatedDict = generateDictionaryFromArrayNEW(bmarksMainAO);

  // console.log(
  //   "Path 2 💧💧- updateArrayAndDictNEW - Final bmarksMainAO:",
  //   bmarksMainAO
  // );
  // console.log(
  //   "Path 2 💧💧- updateArrayAndDictNEW - Final updatedDict:",
  //   updatedDict
  // );

  return { bmarksMainAO, updatedDict };
}

// Define manageAODM to call loadAODM
function manageAODM() {
  loadAODM();
}

// Exporting the master function, the dictionary, and the array
export { manageAODM, bmarksDictProcessed_new, bmarksMainAO };
