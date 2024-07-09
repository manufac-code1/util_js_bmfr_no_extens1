import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
} from "./mod8State.js";

import { folderRenameTest1 } from "./mod5FolderRenamer.js";

let jsTreeInstance;

function handleSelectionChange(node, isSelected) {
  const currentTitle = node.text;
  const previousSelectedNode = getPreviousSelectedNode();
  const folderTitlesPrev = getFolderTitlePrev();

  if (isSelected) {
    if (previousSelectedNode && previousSelectedNode.id === node.id) {
      console.log("🔍 Node is already selected:", node.text);
      return currentTitle;
    }

    const previousTitle = folderTitlesPrev[node.id] || currentTitle;
    const newTitle = `NewNameHere [${previousTitle}]`;
    folderTitlesPrev[node.id] = currentTitle;

    setPreviousSelectedNode(node);
    setFolderTitlePrev(folderTitlesPrev);

    return newTitle;
  } else {
    const originalTitle = folderTitlesPrev[node.id] || currentTitle;
    setPreviousSelectedNode(null);
    return originalTitle;
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
    const updatedText = handleSelectionChange(selectedNode, true);
    jsTreeInstance.set_text(selectedNode, updatedText);
  });

  $("#bookmarkTree").on("deselect_node.jstree", function (e, data) {
    const deselectedNode = data.node;
    const updatedText = handleSelectionChange(deselectedNode, false);
    jsTreeInstance.set_text(deselectedNode, updatedText);
  });
}
