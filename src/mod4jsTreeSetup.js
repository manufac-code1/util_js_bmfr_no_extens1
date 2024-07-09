import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
} from "./mod8State.js";

import { folderRenameTest1 } from "./mod5FolderRenamer.js";

let jsTreeInstance;
let isRenaming = false;

function handleSelectionChange(node, isSelected) {
  console.log(
    `🔍 handleSelectionChange called for node: ${node.text}, isSelected: ${isSelected}`
  );

  const currentTitle = node.text;

  if (isSelected) {
    if (isRenaming) {
      console.log("Renaming in progress, skipping rename.");
      return currentTitle;
    }
    isRenaming = true;
    const previousTitle = currentTitle;
    const newTitle = `NewNameHere [${previousTitle}]`;
    isRenaming = false;
    return newTitle;
  } else {
    return currentTitle;
  }
}

export function jsTreeSetup1Initial(bookmarkData) {
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

  // Ensure no initial selection
  const jsTreeInstance = $("#bookmarkTree").jstree(true);
  jsTreeInstance.deselect_all();
}

export function jsTreeSetup2Populate(bookmarkData) {
  jsTreeInstance = $("#bookmarkTree").jstree(true);
  jsTreeInstance.settings.core.data = bookmarkData;
  jsTreeInstance.refresh();
}

let eventHandlersAttached = false;

export function jsTreeSetup3EventHandlers() {
  const jsTreeInstance = $("#bookmarkTree").jstree(true);

  $("#bookmarkTree").on("select_node.jstree", function (e, data) {
    const selectedNode = data.node;

    // Get the previously selected node
    const previousSelectedNode = getPreviousSelectedNode();

    // Check if the selected node is different from the previously selected node
    if (!previousSelectedNode || previousSelectedNode.id !== selectedNode.id) {
      const updatedText = handleSelectionChange(selectedNode, true);
      jsTreeInstance.set_text(selectedNode, updatedText);

      // Update the previous selected node
      setPreviousSelectedNode(selectedNode);
    }
  });

  $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
    const deselectedNode = data.node;
    const updatedText = handleSelectionChange(deselectedNode, false);
    jsTreeInstance.set_text(deselectedNode, updatedText);

    // Clear the previous selected node if it is the deselected node
    const previousSelectedNode = getPreviousSelectedNode();
    if (previousSelectedNode && previousSelectedNode.id === deselectedNode.id) {
      setPreviousSelectedNode(null);
    }
  });
}
