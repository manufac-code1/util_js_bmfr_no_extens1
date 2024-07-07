import {
  isInitializing,
  originalTexts,
  previousSelectedNode,
  renameChildFolders,
} from "./index.js";

export function jsTreeSetupAndPopulate(bookmarkData) {
  console.log("Setting up jsTree with data:", bookmarkData); // Log initial data

  $("#bookmarkTree").jstree({
    core: {
      data: bookmarkData,
      check_callback: true,
      themes: {
        name: "default-dark",
        dots: true,
        icons: true,
        url: "libs/themes/default-dark/style.css",
      },
    },
    types: {
      default: { icon: "jstree-folder" },
      file: { icon: "jstree-file" },
    },
    state: { key: "bookmarkTreeState" },
    plugins: ["state", "types", "search", "lazy"],
  });

  const jsTreeInstance = $("#bookmarkTree").jstree(true);

  // Clear any existing event listeners to avoid duplication
  $("#bookmarkTree").off("select_node.jstree");
  $("#bookmarkTree").off("deselect_node.jstree");

  // Attach event handlers for node selection and deselection
  $("#bookmarkTree").on("select_node.jstree", function (e, data) {
    if (isInitializing) {
      console.log("Skipping renaming during initialization.");
      return;
    }

    const selectedNode = data.node;
    console.log("Node selected:", selectedNode); // Log selected node

    // Store original text if it's not already stored
    if (!originalTexts[selectedNode.id]) {
      originalTexts[selectedNode.id] = selectedNode.text;
    }

    // Use jsTree command to get children of the selected node
    const childrenNodes = jsTreeInstance
      .get_children_dom(selectedNode)
      .toArray(); // Convert to array
    console.log("Children nodes:", childrenNodes); // Log children nodes

    // Ensure childrenNodes is an array
    if (childrenNodes && childrenNodes.length > 0) {
      const selectedNodeWithChildren = {
        ...selectedNode,
        children: childrenNodes.map((child) => jsTreeInstance.get_node(child)),
      };

      // Rename child folders
      renameChildFolders(selectedNodeWithChildren, true, "candidateNewName");
    } else {
      console.log("No child nodes found for the selected node.");
    }

    // Update the previously selected node
    previousSelectedNode = selectedNode;
  });

  $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
    const deselectedNode = data.node;
    console.log("Node deselected:", deselectedNode); // Log deselected node

    // Use jsTree command to get children of the deselected node
    const childrenNodes = jsTreeInstance
      .get_children_dom(deselectedNode)
      .toArray(); // Convert to array
    console.log("Children nodes:", childrenNodes); // Log children nodes

    // Ensure childrenNodes is an array
    if (childrenNodes && childrenNodes.length > 0) {
      const deselectedNodeWithChildren = {
        ...deselectedNode,
        children: childrenNodes.map((child) => jsTreeInstance.get_node(child)),
      };

      // Restore original names for child nodes
      renameChildFolders(deselectedNodeWithChildren, false, "");
    } else {
      console.log("No child nodes found for the deselected node.");
    }

    // Clear previously selected node if it is the same as deselected node
    if (previousSelectedNode && previousSelectedNode.id === deselectedNode.id) {
      previousSelectedNode = null;
    }
  });

  // Set isInitializing to false after initial setup
  setTimeout(() => {
    isInitializing = false;
    console.log("Initialization complete.");
  }, 0);
}
