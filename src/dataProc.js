// dataProc.js
export function parseInitialData(data) {
  // Your parsing logic here
  const parsedData = data.map((item) => {
    // Example parsing logic
    return {
      id: item.id,
      title: item.title || "Untitled",
      children: item.children || [],
    };
  });
  return parsedData;
}
