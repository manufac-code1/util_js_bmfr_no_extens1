// src/folderRenamer.js
export function addEmojiToTitle(node) {
  const emoji = "🟢";
  node.text += ` ${emoji}`;
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(addEmojiToTitle); // Recursively apply to children
  }
  return node;
}
