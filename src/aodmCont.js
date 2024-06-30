export default function fetchAndProcessJSON() {
  console.log("🍑🍑 Fetching and processing JSON data...");

  fetch("data/chrome_bookmarks_all.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("🍑🍑 Data fetched:", data);
      // Further processing will be added incrementally
    })
    .catch((error) => console.error("🍑🍑 Error fetching JSON data:", error));
}
