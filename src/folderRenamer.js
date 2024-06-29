export default function addEmojiToTitle(title, isSelected) {
  console.log("🟫🟫Title:", title, "IsSelected:", isSelected);

  if (isSelected) {
    console.log("🟪🟪Title:", title, "IsSelected:", isSelected);
    const emoji = "🟢";
    return `${title} ${emoji}`;
  } else {
    return title;
  }
}
