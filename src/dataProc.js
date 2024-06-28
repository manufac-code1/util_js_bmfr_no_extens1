export default function parseInitialData(data) {
  console.log("MOD 1a: parseInitialData - Input data:", data);
  const parsedData = data.map((item) => {
    const parsedItem = {
      id: item.id,
      title: item.title || "Untitled",
      children: item.children || [],
    };
    console.log("MOD 1b: parseInitialData - Parsed item:", parsedItem);
    return parsedItem;
  });
  console.log("MOD 1c: parseInitialData - Output data:", parsedData);
  return parsedData;
}
