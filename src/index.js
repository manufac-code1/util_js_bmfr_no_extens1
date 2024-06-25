import './index.css';
import { createAODM } from './createAODM.js';

document.addEventListener('DOMContentLoaded', function () {
  import('./createAODM.js').then(({ createAODM }) => {
    // Updated index.js

fetch('./data/specific_node_33645.json')
  .then(response => response.json())
  .then(data => {
    console.log("Fetched data: ", data);
    const { AODM, dictionaryMap } = createAODM(data);
    console.log("AODM Array: ", AODM);
    console.log("AODM Dictionary: ", dictionaryMap);

    // Ensure jsTree data format
    const jsTreeData = AODM.map(node => ({
      id: node.id,
      parent: node.parentId ? node.parentId : '#', // assuming root nodes have no parentId
      text: node.title,
      icon: node.type === 'bookmark' ? 'file' : 'folder',
    }));
    
    console.log("Formatted Data for jsTree: ", jsTreeData);

    $('#jstree_demo_div').jstree({
      'core': {
        'data': jsTreeData,
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