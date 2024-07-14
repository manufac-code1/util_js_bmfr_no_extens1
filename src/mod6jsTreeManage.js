import { bmarksProc1FormatForJsTree } from "./mod3aodmSetup.js";
import { setNodeState, bmarksMainAO } from "./mod4aodmManage.js";
import { jsTreeInstance } from "./mod5jsTreeSetup.js";

import {
  getFolderTitlePrev,
  setFolderTitlePrev,
  clearFolderTitlePrev,
  setPreviousSelectedNode,
  getPreviousSelectedNode,
} from "./mod2State.js";

let isRenaming = false;

export function jsTreeSetup4EventHandlers() {
  if (!jsTreeInstance) {
    console.error("jsTreeInstance is not defined");
    return;
  }

  console.log("6a jsTreeSetup4EventHandlers is called."); // Add this line for verification

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

      console.log("6d Select node event triggered for node:", selectedNode);

      const previousTitles = getFolderTitlePrev();
      console.log("6e Getting previous titles:", previousTitles);

      if (!previousTitles[selectedNode.id]) {
        setFolderTitlePrev({
          ...previousTitles,
          [selectedNode.id]: selectedNode.text,
        });
        console.log("6f Setting previous title for node:", {
          ...previousTitles,
          [selectedNode.id]: selectedNode.text,
        });
      }

      const updatedText = handleSelectionChange(selectedNode, true);
      jsTreeInstance.set_text(selectedNode, updatedText);

      // Update state in AODM
      setNodeState(bmarksMainAO, selectedNode.id, "selected", true);

      const previousSelectedNode = getPreviousSelectedNode();
      if (previousSelectedNode) {
        setNodeState(
          bmarksMainAO,
          previousSelectedNode.id,
          "selectedPrev",
          true
        );
      }

      setPreviousSelectedNode(selectedNode);
      console.log("6g Setting previous selected node:", selectedNode); // Updated line
    });

  $("#bookmarkTree")
    .off("deselect_node.jstree")
    .on("deselect_node.jstree", function (e, data) {
      e.stopPropagation();
      e.preventDefault();
      const deselectedNode = data.node;

      console.log("6h Deselect node event triggered for node:", deselectedNode); // Updated line

      const previousTitles = getFolderTitlePrev();
      console.log("6i Getting previous titles:", previousTitles); // Updated line

      const previousTitle = previousTitles[deselectedNode.id];
      console.log("6j Getting previous title for node:", previousTitle); // Updated line

      if (previousTitle) {
        jsTreeInstance.set_text(deselectedNode, previousTitle);
        console.log(
          `6k Set text for node ${deselectedNode.id} to previous title: ${previousTitle}`
        );
        clearFolderTitlePrev(deselectedNode.id);
        console.log("6l Clearing previous title for node:", deselectedNode); // Updated line
      }

      const previousSelectedNode = getPreviousSelectedNode();
      if (
        previousSelectedNode &&
        previousSelectedNode.id === deselectedNode.id
      ) {
        setNodeState(bmarksMainAO, deselectedNode.id, "selected", false);
        setPreviousSelectedNode(null);
        console.log("6m Clearing previous selected node:", deselectedNode.id); // Updated line
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
