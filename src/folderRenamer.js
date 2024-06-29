function addEmojiToTitle(title, isSelected) {
  if (isSelected) {
    const emoji = "🟢";
    return `${title} ${emoji}`;
  } else {
    return title;
  }
}
