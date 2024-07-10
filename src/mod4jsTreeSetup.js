import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
  clearFolderTitlePrev,
} from "./mod8State.js";

import { folderRenameTest1 } from "./mod6FolderRenamer.js";
import { markNodesAsOpened } from "./mod3aodmManage.js"; // If this function is used
import { jsTreeSetup3EventHandlers } from "./mod5jsTreeManage.js"; // Ensure correct import for jsTreeSetup3EventHandlers

let jsTreeInstance;
// let isRenaming = false;
let localPreviousTitles = {};

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
  jsTreeInstance = $("#bookmarkTree").jstree(true);
  jsTreeInstance.deselect_all();
}

export function jsTreeSetup2Populate(bookmarkData) {
  jsTreeInstance = $("#bookmarkTree").jstree(true);
  jsTreeInstance.settings.core.data = bookmarkData;
  jsTreeInstance.refresh();
}

export function jsTreeSetup(bookmarkData) {
  console.log("Starting jsTree setup and populate");
  jsTreeSetup1Initial(bookmarkData);
  jsTreeSetup2Populate(bookmarkData);
  jsTreeSetup3EventHandlers();
  console.log("jsTree setup and populate complete");
}

export { jsTreeInstance };
