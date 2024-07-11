let previousSelectedNode = null;
let folderTitlesPrev = {};

export function setPreviousSelectedNode(node) {
  console.log("Setting previous selected node:", node);
  previousSelectedNode = node;
}

export function getPreviousSelectedNode() {
  console.log("Getting previous selected node:", previousSelectedNode);
  return previousSelectedNode;
}

export function setFolderTitlePrev(texts) {
  console.log("Setting previous title for node:", texts);
  folderTitlesPrev = texts;
}

export function getFolderTitlePrev() {
  console.log("Getting previous titles:", folderTitlesPrev);
  return folderTitlesPrev;
}

export function clearFolderTitlePrev(id) {
  console.log("Clearing previous title for node:", id);
  delete folderTitlesPrev[id];
}
