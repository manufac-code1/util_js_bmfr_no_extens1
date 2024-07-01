let aodmDictionary = {};
import { formatJsTreeNode } from "./index.js";

export default function manageAODM() {
  loadAODM();
}

function loadAODM() {
  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((dataNEW) => {
      console.log("•01: loadAODM - dataNEW:", dataNEW);
      initializeAODM(dataNEW.children);
    })
    .catch((error) => console.error("• Error fetching JSON data:", error));
}

function initializeAODM(dataNEW) {
  console.log("•02: initializeAODM - dataNEW.children:", dataNEW);
  console.log("•03: Array.isArray - dataNEW:", Array.isArray(dataNEW));

  const parsedDataNEW = parseInitialDataNEW(dataNEW);
  console.log("•10: parseInitialDataNEW - parsedDataNEW:", parsedDataNEW);

  const cleanedDataNEW = cleanParsedDataNEW(parsedDataNEW);
  console.log("•11: cleanParsedDataNEW - cleanedDataNEW:", cleanedDataNEW);

  const renamedDataNEW = applyPostParsingRenamingNEW(cleanedDataNEW);
  console.log(
    "•12: applyPostParsingRenamingNEW - renamedDataNEW:",
    renamedDataNEW
  );

  const updatedDict = generateDictionaryFromArrayNEW(renamedDataNEW);
  console.log(
    "•13: generateDictionaryFromArrayNEW - updatedDict:",
    updatedDict
  );

  aodmDictionary = updatedDict; // Save the dictionary for export

  const { updatedArray, updatedDictNEW } = updateArrayAndDictNEW(
    [],
    updatedDict,
    renamedDataNEW
  );
  console.log(
    "•14: updateArrayAndDictNEW - updatedArray and updatedDictNEW:",
    updatedArray,
    updatedDictNEW
  );

  // Additional processing can be added here
}

export { manageAODM, aodmDictionary }; // Exporting both the master function and the dictionary

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
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
function updateArrayAndDictNEW(array, dict, newBookmarkData) {
  array.length = 0;
  for (let key in dict) delete dict[key];

  const updatedArray = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArrayNEW(updatedArray);

  console.log("updateArrayAndDictNEW - updatedArray: ", updatedArray);
  // console.log("SECTION 4r: ", updatedDict);

  return { updatedArray, updatedDict };
}
