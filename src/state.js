let previousSelectedNode = null;
let originalTexts = {};

export function setPreviousSelectedNode(node) {
  previousSelectedNode = node;
}

export function getPreviousSelectedNode() {
  return previousSelectedNode;
}

export function setOriginalTexts(texts) {
  originalTexts = texts;
}

export function getOriginalTexts() {
  return originalTexts;
}
