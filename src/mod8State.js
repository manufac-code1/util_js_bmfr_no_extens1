let previousSelectedNode = null;
let folderTitlesPrev = {};

export function setPreviousSelectedNode(node) {
  previousSelectedNode = node;
}

export function getPreviousSelectedNode() {
  return previousSelectedNode;
}

export function setFolderTitlePrev(texts) {
  folderTitlesPrev = texts;
}

export function getFolderTitlePrev() {
  return folderTitlesPrev;
}
