// let currentSelectedNode = null; // Global variable to store selected node ID

import './index.css';

import { loadAndProcessBookmarkData } from './mod3aodmSetup.js'; // Import the moved functions and initializeAODMWithProcessedData

document.addEventListener('DOMContentLoaded', async function () {
  await loadAndProcessBookmarkData();
});
