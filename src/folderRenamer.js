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

import { jsTreeInstance } from "./jsTreeSetup"; // Ensure jsTreeInstance is accessible here

export function renameChildFolders(selectedNode, isSelected, candidateNewName) {
  console.log(
    "Renaming child folders for node:",
    selectedNode,
    "IsSelected:",
    isSelected
  );
  if (selectedNode.children && selectedNode.children.length > 0) {
    console.log("Selected node has children:", selectedNode.children); // Log children
    selectedNode.children.forEach((childId) => {
      const child = jsTreeInstance.get_node(childId);
      console.log(
        "Processing child node:",
        child,
        "with candidateNewName:",
        candidateNewName
      ); // Log each child node with candidateNewName
      if (child.type === "default") {
        const originalName = child.text;
        child.originalName = originalName; // Store the original name
        const newName = `${candidateNewName} [${originalName}]`; // Rename the folder
        console.log("Renamed child folder:", child, "to:", newName);

        // Use jsTree's rename_node method
        jsTreeInstance.rename_node(child.id, newName);
      }
    });
  } else {
    console.log("Selected node has no children or is not a folder.");
  }
  if (!isSelected) {
    if (selectedNode.children && selectedNode.children.length > 0) {
      selectedNode.children.forEach((childId) => {
        const child = jsTreeInstance.get_node(childId);
        if (child.type === "default" && child.originalName) {
          const originalName = child.originalName;
          console.log(
            "Restored child folder name:",
            child,
            "to:",
            originalName
          );

          // Use jsTree's rename_node method to restore original name
          jsTreeInstance.rename_node(child.id, originalName);
        }
      });
    }
  }

  // Refresh the tree to reflect the changes
  jsTreeInstance.refresh();
}
