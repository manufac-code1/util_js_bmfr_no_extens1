import './libs/jstree.min.js';
import { createAODM } from './createAODM';
import $ from './libs/jQuery.min.js';

$(document).ready(function() {
  fetch('./data/specific_node_33645.json')
    .then(response => response.json())
    .then(data => {
      console.log("Fetched data: ", data);
      const { AODM, dictionaryMap } = createAODM(data);
      console.log("AODM Array: ", AODM);
      console.log("AODM Dictionary: ", dictionaryMap);

      const formattedData = AODM.map(node => ({
        id: node.id,
        parent: node.parentId === '0' ? '#' : node.parentId,
        text: node.title,
        icon: node.type === 'folder' ? 'jstree-folder' : 'jstree-file',
        children: node.children
      }));

      console.log("Formatted Data for jsTree: ", formattedData);

      $('#jstree_demo_div').jstree({
        'core': {
          'data': formattedData,
          'themes': {
            'name': 'default-dark',
            'dots': true,
            'icons': true
          }
        }
      });
    })
    .catch(error => console.error("Error loading JSON data:", error));
});

// Event listeners for control bar buttons
document.getElementById('backupButton').addEventListener('click', function () {
  console.log('Backup button clicked');
  // Implement backup functionality here
});

document.getElementById('renameButton').addEventListener('click', function () {
  console.log('Rename button clicked');
  // Implement rename functionality here
});

document.getElementById('undoButton').addEventListener('click', function () {
  console.log('Undo button clicked');
  // Implement undo functionality here
});