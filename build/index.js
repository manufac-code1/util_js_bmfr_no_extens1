/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/specific_node_33645.json').then(response => response.json()).then(data => {
    console.log('Fetched data:', data); // Log fetched data
    const bookmarksArray = data.children.map(node => formatJsTreeNode(node));
    console.log('Bookmarks Array:', bookmarksArray); // Log bookmarks array

    // Generate dictionary from bookmarksArray
    const bookmarksDict = generateDictionaryFromArray(bookmarksArray);
    console.log('Bookmarks Dictionary:', bookmarksDict); // Log bookmarks dictionary

    // Use the bookmarksArray directly for jsTree
    $('#bookmarkTree').jstree({
      'core': {
        'data': bookmarksArray,
        'check_callback': true,
        'themes': {
          'name': 'default-dark',
          'dots': true,
          'icons': true,
          'url': 'libs/themes/default-dark/style.css' // Ensure the correct path to the theme's CSS file
        }
      }
    });
  }).catch(error => console.error('Error loading JSON data:', error));
});
function formatJsTreeNode(node) {
  const formattedNode = {
    id: node.id,
    text: node.title,
    children: node.children ? node.children.map(child => formatJsTreeNode(child)) : false,
    a_attr: {
      href: node.url
    }
  };
  return formattedNode;
}
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
function updateArrayAndDict(array, dict, newBookmarkData) {
  // Clear the existing array and dictionary
  array.length = 0;
  for (let key in dict) delete dict[key];

  // Process the new data
  const updatedArray = newBookmarkData.map(node => formatJsTreeNode(node));
  array.push(...updatedArray);
  const updatedDict = generateDictionaryFromArray(updatedArray);

  // Log updated structures for inspection
  console.log(updatedArray);
  console.log(updatedDict);
  return {
    updatedArray,
    updatedDict
  };
}
/******/ })()
;