import $ from 'jquery';
import 'jstree';

$(document).ready(function() {
    // Fetch the JSON data from the new location
    $.getJSON('libs/data/specific_node_33645.json', function(data) {
        // Convert the JSON data to an array of objects
        const bookmarksArray = convertToJsTreeFormat(data.children);
        
        // Generate the dictionary from the array of objects
        const bookmarksDict = generateDictionaryFromArray(bookmarksArray);

        // Log the array of objects and dictionary to the console for inspection
        console.log(bookmarksArray);
        console.log(bookmarksDict);
        
        // Initialize jsTree with the array of objects
        $('#jstree').jstree({
            'core': {
                'data': bookmarksArray,
                'check_callback': true,
                'themes': {
                    'name': 'default',
                    'dots': true,
                    'icons': true
                }
            }
        });
    });
});

// Function to convert JSON data to jsTree format
function convertToJsTreeFormat(children) {
    return children.map(child => {
        const node = {
            'text': child.title,
            'children': child.children ? convertToJsTreeFormat(child.children) : [],
            'a_attr': child.url ? { 'href': child.url } : {}
        };
        node.id = child.id; // Ensure each node has an id for dictionary lookup
        return node;
    });
}

// Function to generate a dictionary from the array of objects
function generateDictionaryFromArray(array) {
    const dict = {};
    array.forEach(node => {
        dict[node.id] = node;
        if (node.children) {
            Object.assign(dict, generateDictionaryFromArray(node.children));
        }
    });
    return dict;
}

// Function to update the array and regenerate the dictionary
function updateArrayAndDict(array, dict, newBookmarkData) {
    // Clear the existing array and dictionary
    array.length = 0;
    for (let key in dict) delete dict[key];

    // Process the new data
    const updatedArray = convertToJsTreeFormat(newBookmarkData);
    array.push(...updatedArray);
    const updatedDict = generateDictionaryFromArray(updatedArray);

    // Log updated structures for inspection
    console.log(updatedArray);
    console.log(updatedDict);

    return { updatedArray, updatedDict };
}