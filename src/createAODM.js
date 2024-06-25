// Updated createAODM.js
export function createAODM(data) {
    console.log('Fetched bookmarks data:', data);
    if (!data.children || !Array.isArray(data.children)) {
        console.error('Top level object does not have children property', data);
        return;
    }

    const AODM = [];
    const dictionaryMap = {};

    function traverseAndBuild(node) {
        const nodeCopy = { ...node };
        if (node.children && Array.isArray(node.children)) {
            nodeCopy.children = [];
            node.children.forEach(child => {
                const childCopy = traverseAndBuild(child);
                nodeCopy.children.push(childCopy);
            });
        }
        dictionaryMap[node.id] = nodeCopy;
        return nodeCopy;
    }

    data.children.forEach(node => {
        const nodeCopy = traverseAndBuild(node);
        AODM.push(nodeCopy);
    });

    console.log('AODM created:', AODM);
    console.log('Dictionary Map created:', dictionaryMap);

    return { AODM, dictionaryMap };
}