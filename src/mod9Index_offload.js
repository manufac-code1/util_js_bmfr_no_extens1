// Formatting nodes for jsTree, ensuring all necessary properties are set for the AODM
export function formatJsTreeNode(node) {
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

// Parsing the initial data structure into a usable format, preparing it for integration into the AODM
export function bmarksProc1Parse(data) {
  return data.map((node) => {
    const children = node.children ? bmarksProc1Parse(node.children) : [];
    return {
      id: node.id,
      title: node.text || null,
      url: node.data ? node.data.url : undefined,
      children: children,
    };
  });
}

// Cleaning the parsed data to ensure it has the correct properties for the AODM
export function bmarksProc2Clean(data) {
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
      children: node.children ? bmarksProc2Clean(node.children) : [],
    };
  });
}

// Applying post-parsing renaming to nodes for consistency in the AODM
export function bmarksProc3Rename(sst) {
  sst.forEach((node) => {
    // Standardize the name for the `chrome://bookmarks/` bookmark
    if (node.url === "chrome://bookmarks/") {
      node.title = "⭐️ [chrome://bookmarks/] (do not mod)";
    }

    // Apply other renaming rules as needed
    if (node.children) {
      bmarksProc3Rename(node.children);
    }
  });
  return sst;
}

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
