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

// Function to prepare the bmarksArrJSTree1 array based on bmarksMainAO
export function prepareJSTreeNodes(bmarksMainAO, pathToTestNode) {
  let bmarksArrJSTree1 = bmarksMainAO.map((bmarkNode) => {
    if (bmarkNode.id === "1") {
      return { ...bmarkNode, state: { opened: BookmarksBarOpen } };
    } else if (bmarkNode.id === "2") {
      return { ...bmarkNode, state: { opened: OtherBookmarksOpen } };
    } else if (bmarkNode.id === "3") {
      return { ...bmarkNode, state: { opened: MobileBookmarksOpen } };
    }
    return bmarkNode;
  });

  if (RenamingTestingFolderOpen && pathToTestNode) {
    bmarksArrJSTree1 = markNodesAsOpened(bmarksArrJSTree1, pathToTestNode);
  }

  return bmarksArrJSTree1;
}

export function jsTreeSetup(bookmarkData) {
  console.log("Starting jsTree setup and populate");
  jsTreeSetup1Initial(bookmarkData);
  jsTreeSetup2Populate(bookmarkData);
  jsTreeSetup3EventHandlers();
  console.log("jsTree setup and populate complete");
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

export function jsTreeSetup3EventHandlers() {
  jsTreeInstance = $("#bookmarkTree").jstree(true);

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

      if (isRenaming) {
        console.log("Renaming in progress, skipping...");
        return;
      }
      isRenaming = true;

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

      isRenaming = false;
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
