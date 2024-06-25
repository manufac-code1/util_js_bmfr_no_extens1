/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/specific_node_33645.json').then(response => response.json()).then(data => {
    console.log('Fetched data:', data); // Log fetched data
    const formattedData = data.children.map(node => formatJsTreeNode(node));
    console.log('Formatted data:', formattedData); // Log formatted data
    $('#bookmarkTree').jstree({
      'core': {
        'data': formattedData,
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
/******/ })()
;