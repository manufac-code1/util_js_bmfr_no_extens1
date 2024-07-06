// export default function addEmojiToTitle(title, isSelected) {
//   const emoji = "🟢";
//   if (isSelected) {
//     console.log("🐭Title:", title, "IsSelected:", isSelected);
//     if (!title.includes(emoji)) {
//       return `${title} ${emoji}`;
//     }
//   } else {
//     return title.replace(emoji, "").trim();
//   }
//   return title;
// }

export function renameChildFolders(selectedNode, isSelected, candidateNewName) {
  console.log(
    "Renaming child folders for node:",
    selectedNode,
    "IsSelected:",
    isSelected
  );
  if (selectedNode.children && selectedNode.children.length > 0) {
    console.log("Selected node has children:", selectedNode.children); // Log children
    selectedNode.children.forEach((child) => {
      console.log(
        "Processing child node:",
        child,
        "with candidateNewName:",
        candidateNewName
      ); // Log each child node with candidateNewName
      if (child.type === "default") {
        // Assuming 'default' type indicates a folder
        console.log("Child node is a folder:", child); // Log folder type child
        const originalName = child.text;
        child.originalName = originalName; // Store the original name
        child.text = `${candidateNewName} [${originalName}]`; // Rename the folder
        console.log("Renamed child folder:", child, "to:", child.text);
      } else {
        console.log("Child node is not a folder:", child);
      }
    });
  } else {
    console.log("Selected node has no children or is not a folder.");
  }
  if (!isSelected) {
    if (selectedNode.children && selectedNode.children.length > 0) {
      selectedNode.children.forEach((child) => {
        if (child.type === "default" && child.originalName) {
          child.text = child.originalName; // Restore the original name
          console.log("Restored child folder name:", child);
        }
      });
    }
  }
}
