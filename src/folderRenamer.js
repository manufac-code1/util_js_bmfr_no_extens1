import addEmojiToTitle from "./folderRenamer";

// Function to handle jsTree node selection
function handleJsTreeNodeSelection(e, data) {
  const selectedNodeId = data.node.id;
  const selectedNodeText = data.node.text;
  console.log(
    `Node selected: ID = ${selectedNodeId}, Text = ${selectedNodeText}`
  );

  // Update the selection state
  bookmarkData.forEach((node) => {
    node.state.selected = node.id === selectedNodeId;
    if (node.children) {
      node.children.forEach((child) => {
        child.state.selected = child.id === selectedNodeId;
      });
    }
  });

  // Re-render jsTree with updated selection states
  setupAndPopulateJsTree(bookmarkData);
}
