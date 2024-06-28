export default function parseInitialData(data) {
  const parsedData = data.map((item) => {
    return {
      id: item.id,
      title: item.title || "Untitled",
      children: item.children || [],
    };
  });
  return parsedData;
}
