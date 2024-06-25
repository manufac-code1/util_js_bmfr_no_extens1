import './index.css';
import { createAODM } from './createAODM.js';

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/specific_node_33645.json')
    .then(response => response.json())
    .then(data => {
      console.log('Fetched data:', data);
      if (data.children && Array.isArray(data.children)) {
        const { aodm, dictionaryMap } = createAODM(data);

        console.log('AODM Array:', aodm);
        console.log('AODM Dictionary:', dictionaryMap);

        const formattedData = aodm.map(node => ({
          id: node.id,
          text: node.title,
          children: node.children,
          a_attr: node.a_attr
        }));

        console.log('Formatted Data for jsTree:', formattedData);

        $('#bookmarkTree').jstree({
          core: {
            data: formattedData,
            check_callback: true,
          },
          themes: {
            name: 'default-dark',
            responsive: true,
          },
        });
      } else {
        console.error('Expected an array but got:', data);
      }
    })
    .catch(error => console.error('Error loading JSON data:', error));
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