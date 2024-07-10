import { formatJsTreeNode } from "./mod2aodmSetup.js";

// Getting child nodes of a given parent ID, for integration into the AODM
export function getChildNodes(data, parentId) {
  return data.filter((node) => node.parent === parentId);
}

// Declaration for dictGenerationCount
let dictGenerationCount = 0;

// Generating a dictionary from an array of bookmarks, used for the AODM
export function generateDictionaryFromArray(array) {
  const dict = {};
  array.forEach((node) => {
    dict[node.id] = node;
    if (node.children) {
      Object.assign(dict, generateDictionaryFromArray(node.children));
    }
  });
  dictGenerationCount++;
  return dict;
}

// Updating the array and dictionary with new bookmark data, ensuring synchronization within the AODM
export function updateArrayAndDict(array, dict, newBookmarkData) {
  array.length = 0; // Clear the array
  for (let key in dict) delete dict[key]; // Clear the dictionary

  const bmarksMainAO = newBookmarkData.map((node) => formatJsTreeNode(node));
  array.push(...bmarksMainAO); // Update the array with new data
  const bmarksMainDM = generateDictionaryFromArray(bmarksMainAO); // Generate the dictionary from the updated array

  return { bmarksMainAO, bmarksMainDM };
}

export function markNodesAsOpened(nodes, path) {
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

export function setNodeState(nodes, nodeId, newState) {
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

export function findPathToNode(nodes, nodeId) {
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

export function setAODMData(bmarksDictInitial) {
  // Set the bmarksDictInitial object
  // Placeholder for any logic needed to set the bmarksDictInitial
  // console.log("🟩AODM Dictionary set:", bmarksDictInitial);
}
