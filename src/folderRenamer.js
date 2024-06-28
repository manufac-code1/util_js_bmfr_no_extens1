// src/folderRenamer.js
// External function to add emoji to the title
function addEmojiToTitle(nodes) {
  const emoji = "🟢";
  const updatedNodes = nodes.map((node) => ({
    ...node,
    text: `${node.text} ${emoji}`,
    children: node.children ? addEmojiToTitle(node.children) : [],
  }));
  console.log("Updated nodes with emoji:", updatedNodes);
  return updatedNodes;
}

export { addEmojiToTitle };
