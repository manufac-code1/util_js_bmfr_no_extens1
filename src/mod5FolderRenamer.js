import {
  setPreviousSelectedNode,
  getPreviousSelectedNode,
  setFolderTitlePrev,
  getFolderTitlePrev,
} from "./mod8State.js";

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

let renameCounter = 0; // Initialize the counter

export function folderRenameTest1(node, isSelected) {
  renameCounter++; // Increment the counter
  console.log(`folderRenameTest1 called ${renameCounter} times`); // Log the counter

  const currentTitle = node.text;
  if (isSelected) {
    const previousTitle = currentTitle;
    const newTitle = `NewNameHere [${previousTitle}]`;
    return newTitle;
  }
  return currentTitle;
}
