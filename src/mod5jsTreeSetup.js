import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
  clearFolderTitlePrev,
} from "./mod2State.js";

import { folderRenameTest1 } from "./mod7FolderRenamer.js";
import { markNodesAsOpened, findPathToNode } from "./mod4aodmManage.js"; // If this function is used
import { jsTreeSetup4EventHandlers } from "./mod6jsTreeManage.js"; // Ensure correct import for jsTreeSetup4EventHandlers

// User-declared variables for initial open/close state
const BookmarksBarOpen = false;
const OtherBookmarksOpen = false;
const MobileBookmarksOpen = true;
const RenamingTestingFolderOpen = true;
const renamingTestFolderId = "33645";

let jsTreeInstance;
// let isRenaming = false;
let localPreviousTitles = {};

export function jsTreeSetup(bookmarkData) {
  console.log("Starting jsTree setup and populate");
  jsTreeSetup1Initial(bookmarkData);

  const bookmarkDataBeforeFix = JSON.parse(JSON.stringify(bookmarkData));
  console.log("🟨 Before jsTreeSetup2FixPropNames:", bookmarkDataBeforeFix);

  // jsTreeSetup2FixPropNames(bookmarkData);

  const bookmarkDataAfterFix = JSON.parse(JSON.stringify(bookmarkData));
  console.log("🟧 After jsTreeSetup2FixPropNames:", bookmarkDataAfterFix);

  jsTreeSetup2Populate(bookmarkData);
  jsTreeSetup3InitState(bookmarkData); // Call the initial open/close state setup
  jsTreeSetup4EventHandlers();
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
  jsTreeInstance = $("#bookmarkTree").jstree(true);
  jsTreeInstance.deselect_all();
}

function jsTreeSetup2FixPropNames(bookmarkData) {
  const updatedData = bookmarkData.map((node) => {
    return {
      ...node,
      text: node.title, // Map 'title' to 'text' for jsTree
      state: {
        ...node.state,
        selected: node.isSelected, // Map 'isSelected' to jsTree 'state.selected'
      },
      a_attr: node.url ? { href: node.url } : undefined, // Map 'url' to 'a_attr.href' for jsTree
    };
  });
  return updatedData;
}

export function jsTreeSetup2Populate(bookmarkData) {
  jsTreeInstance = $("#bookmarkTree").jstree(true);
  jsTreeInstance.settings.core.data = bookmarkData;
  jsTreeInstance.refresh();
}

function jsTreeSetup3InitState(bookmarkData) {
  let bmarksArrJSTree1 = bookmarkData.map((bmarkNode) => {
    if (bmarkNode.id === "1") {
      return { ...bmarkNode, state: { opened: BookmarksBarOpen } };
    } else if (bmarkNode.id === "2") {
      return { ...bmarkNode, state: { opened: OtherBookmarksOpen } };
    } else if (bmarkNode.id === "3") {
      return { ...bmarkNode, state: { opened: MobileBookmarksOpen } };
    }
    return bmarkNode;
  });

  const pathToTestNode = findPathToNode(bmarksArrJSTree1, renamingTestFolderId);
  if (RenamingTestingFolderOpen && pathToTestNode) {
    bmarksArrJSTree1 = markNodesAsOpened(bmarksArrJSTree1, pathToTestNode);
  }

  jsTreeInstance.settings.core.data = bmarksArrJSTree1;
  jsTreeInstance.refresh();
}

export { jsTreeInstance };
