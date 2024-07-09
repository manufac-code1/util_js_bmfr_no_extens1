import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
  clearFolderTitlePrev,
} from "./mod8State.js";

import { folderRenameTest1 } from "./mod5FolderRenamer.js";

let jsTreeInstance;
let isRenaming = false;

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

let localPreviousTitles = {};

export function jsTreeSetup3EventHandlers() {
  const jsTreeInstance = $("#bookmarkTree").jstree(true);

  $("#bookmarkTree")
    .off("select_node.jstree")
    .on("select_node.jstree", function (e, data) {
      e.stopPropagation();
      e.preventDefault();
      const selectedNode = data.node;

      console.log("Select node event triggered for node:", selectedNode);

      if (!localPreviousTitles[selectedNode.id]) {
        localPreviousTitles[selectedNode.id] = selectedNode.text;
        console.log(
          "Setting local previous title for node:",
          selectedNode.id,
          selectedNode.text
        );
      }

      const updatedText = `NewNameHere [${selectedNode.text}]`;
      jsTreeInstance.set_text(selectedNode, updatedText);
    });

  $("#bookmarkTree")
    .off("deselect_node.jstree")
    .on("deselect_node.jstree", function (e, data) {
      e.stopPropagation();
      e.preventDefault();
      const deselectedNode = data.node;

      console.log("Deselect node event triggered for node:", deselectedNode);

      const previousTitle = localPreviousTitles[deselectedNode.id];
      if (previousTitle) {
        jsTreeInstance.set_text(deselectedNode, previousTitle);
        console.log(
          "Restoring local previous title for node:",
          deselectedNode.id,
          previousTitle
        );
      }
    });
}

function handleSelectionChange(node, isSelected) {
  console.log(
    `🔍 handleSelectionChange called for node: ${node.text}, isSelected: ${isSelected}`
  );
  const currentTitle = node.text;

  if (isSelected) {
    // Store the current title as the previous title before renaming
    const previousTitle = currentTitle;
    setFolderTitlePrev({ [node.id]: previousTitle });

    const newTitle = `NewNameHere [${previousTitle}]`;
    return newTitle;
  } else {
    // Restore the previous title when the node is deselected
    const previousTitle = getFolderTitlePrev()[node.id];
    return previousTitle || currentTitle;
  }
}
