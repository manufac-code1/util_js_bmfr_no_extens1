import { bmarksProc1FormatForJsTree } from "./mod3aodmSetup.js";

let bmarksDictInitial = {};
let bmarksMainAO = []; // Initialize bmarksMainAO here
let logCounter = 0; // Counter to keep track of logged items

// Getting child nodes of a given parent ID, for integration into the AODM
// function getChildNodes(data, parentId) {
//   return data.filter((node) => node.parent === parentId);
// }

// Declaration for dictGenerationCount
let dictGenerationCount = 0;

// Generating a dictionary from an array of bookmarks, used for the AODM
function generateDictionaryFromArray(array) {
  const dict = {};
  array.forEach((node) => {
    dict[node.id] = node;
    if (node.children) {
      Object.assign(dict, generateDictionaryFromArray(node.children));
    }

    // Log the first 10 items
    if (logCounter < 10) {
      // console.log(`Item ${logCounter + 1}:`, node);
      logCounter++;
    }
  });
  dictGenerationCount++;
  bmarksDictInitial = dict; // Assign the generated dictionary to the global variable
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
export function updateArrayAndDict(array, dict, newBookmarkData) {
  array.length = 0; // Clear the array
  for (let key in dict) delete dict[key]; // Clear the dictionary

  bmarksMainAO = newBookmarkData.map((node) =>
    bmarksProc1FormatForJsTree(node)
  );
  array.push(...bmarksMainAO); // Update the array with new data
  const bmarksMainDM = generateDictionaryFromArray(bmarksMainAO); // Generate the dictionary from the updated array
  // console.log("🟪 3. from updateArrayAndDict, bmarksMainAO: ", bmarksMainAO);
  return { bmarksMainAO, bmarksMainDM };
}

export { bmarksMainAO }; // Export bmarksMainAO

export function markNodesAsOpened(nodes, path) {
  // console.log("🟪 4. from markNodesAsOpened, nodes: ", nodes);
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

export function setNodeState(nodes, nodeId, stateKey, newState) {
  console.log(
    "setNodeState called with nodes:",
    JSON.stringify(nodes, null, 2)
  );
  console.log(
    `setNodeState called with nodeId: ${nodeId}, stateKey: ${stateKey}, newState: ${newState}`
  );

  for (const node of nodes) {
    console.log("Checking node:", node);
    if (node.id === nodeId) {
      node.state[stateKey] = newState;
      console.log(`Updated node ${nodeId} ${stateKey} state to ${newState}`);
      if (newState && node.parent) {
        setNodeState(nodes, node.parent, stateKey, true);
      }
      return;
    }
    if (node.children) {
      setNodeState(node.children, nodeId, stateKey, newState);
    }
  }

  console.log(
    "Updated nodes after setNodeState:",
    JSON.stringify(nodes, null, 2)
  );
}

// Update the selected state of the node with ID "1"
setNodeState(bmarksMainAO, "1", "selected", true);

// Check the result in the console
console.log("Updated bmarksMainAO: ", bmarksMainAO);

export function findPathToNode(nodes, nodeId) {
  // console.log("🟪 6. from findPathToNode, nodes: ", nodes);
  for (const node of nodes) {
    if (node.id === nodeId) {
      return [node.id];
    }
    if (node.children) {
      const path = findPathToNode(node.children, nodeId);
      if (path) {
        return [node.id, ...path];
      }
    }
  }
  return null;
}

// Function to log first 10 items
export function logFirst10Items(dictionary) {
  const first10Items = Object.entries(dictionary).slice(0, 10);
  // console.log("First 10 items in the dictionary:", first10Items);
}
