import { bmarksProc1FormatForJsTree } from "./mod2aodmSetup.js";
import { jsTreeInstance } from "./mod4jsTreeSetup.js";

import {
  getFolderTitlePrev,
  setFolderTitlePrev,
  clearFolderTitlePrev,
  setPreviousSelectedNode,
  getPreviousSelectedNode,
} from "./mod8State.js";

let isRenaming = false;

export function jsTreeSetup3EventHandlers() {
  if (!jsTreeInstance) {
    console.error("jsTreeInstance is not defined");
    return;
  }

  // Debounce function to prevent rapid successive calls
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  $("#bookmarkTree")
    .off("select_node.jstree")
    .on("select_node.jstree", function (e, data) {
      e.stopPropagation();
      e.preventDefault();
      const selectedNode = data.node;

      console.log("Select node event triggered for node:", selectedNode);

      // if (getIsRenaming()) {
      //   console.log("Renaming in progress, skipping...");
      //   return;
      // }
      // setIsRenaming(true);

      const previousTitles = getFolderTitlePrev();
      console.log("Getting previous titles:", previousTitles);

      if (!previousTitles[selectedNode.id]) {
        setFolderTitlePrev({
          ...previousTitles,
          [selectedNode.id]: selectedNode.text,
        });
        console.log("Setting previous title for node:", {
          ...previousTitles,
          [selectedNode.id]: selectedNode.text,
        });
      }

      const updatedText = handleSelectionChange(selectedNode, true);
      jsTreeInstance.set_text(selectedNode, updatedText);

      setPreviousSelectedNode(selectedNode);
      console.log("Setting previous selected node:", selectedNode);

      // setIsRenaming(false);
    });

  $("#bookmarkTree")
    .off("deselect_node.jstree")
    .on("deselect_node.jstree", function (e, data) {
      e.stopPropagation();
      e.preventDefault();
      const deselectedNode = data.node;

      console.log("Deselect node event triggered for node:", deselectedNode);

      const previousTitles = getFolderTitlePrev();
      console.log("Getting previous titles:", previousTitles);

      const previousTitle = previousTitles[deselectedNode.id];
      console.log("Getting previous title for node:", previousTitle);

      if (previousTitle) {
        jsTreeInstance.set_text(deselectedNode, previousTitle);
        console.log(
          `Set text for node ${deselectedNode.id} to previous title: ${previousTitle}`
        );
        clearFolderTitlePrev(deselectedNode.id);
        console.log("Clearing previous title for node:", deselectedNode.id);
      }

      const previousSelectedNode = getPreviousSelectedNode();
      if (
        previousSelectedNode &&
        previousSelectedNode.id === deselectedNode.id
      ) {
        setPreviousSelectedNode(null);
        console.log("Clearing previous selected node:", deselectedNode.id);
      }
    });
}

export function handleSelectionChange(node, isSelected) {
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
