/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://util_js_bmfr_no_extens1/./src/index.css?");

/***/ }),

/***/ "./src/createAODM.js":
/*!***************************!*\
  !*** ./src/createAODM.js ***!
  \***************************/
/***/ (() => {

eval("function traverse(node) {\n    if (node.children && Array.isArray(node.children)) {\n        node.children.forEach(child => {\n            traverse(child);\n        });\n    } else {\n        console.warn('Node does not have children property:', node);\n    }\n}\n\nfunction createAODM(data) {\n    console.log('Fetched bookmarks data:', data);\n    if (!data.children || !Array.isArray(data.children)) {\n        console.error('Top level object does not have children property', data);\n        return;\n    }\n\n    const AODM = [];\n    const dictionaryMap = {};\n\n    function traverseAndBuild(node) {\n        const nodeCopy = { ...node };\n        if (node.children && Array.isArray(node.children)) {\n            nodeCopy.children = [];\n            node.children.forEach(child => {\n                const childCopy = traverseAndBuild(child);\n                nodeCopy.children.push(childCopy);\n            });\n        }\n        dictionaryMap[node.id] = nodeCopy;\n        return nodeCopy;\n    }\n\n    data.children.forEach(node => {\n        const nodeCopy = traverseAndBuild(node);\n        AODM.push(nodeCopy);\n    });\n\n    console.log('AODM created:', AODM);\n    console.log('Dictionary Map created:', dictionaryMap);\n\n    return { AODM, dictionaryMap };\n}\n\n//# sourceURL=webpack://util_js_bmfr_no_extens1/./src/createAODM.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.css */ \"./src/index.css\");\n/* harmony import */ var _createAODM_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createAODM.js */ \"./src/createAODM.js\");\n/* harmony import */ var _createAODM_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_createAODM_js__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\ndocument.addEventListener('DOMContentLoaded', function () {\n  fetch('data/specific_node_33645.json')\n    .then(response => response.json())\n    .then(data => {\n      console.log('Fetched data:', data);\n      if (data.children && Array.isArray(data.children)) {\n        const { aodm, dictionaryMap } = (0,_createAODM_js__WEBPACK_IMPORTED_MODULE_1__.createAODM)(data);\n\n        console.log('AODM Array:', aodm);\n        console.log('AODM Dictionary:', dictionaryMap);\n\n        const formattedData = aodm.map(node => ({\n          id: node.id,\n          text: node.title,\n          children: node.children,\n          a_attr: node.a_attr\n        }));\n\n        console.log('Formatted Data for jsTree:', formattedData);\n\n        $('#bookmarkTree').jstree({\n          core: {\n            data: formattedData,\n            check_callback: true,\n          },\n          themes: {\n            name: 'default-dark',\n            responsive: true,\n          },\n        });\n      } else {\n        console.error('Expected an array but got:', data);\n      }\n    })\n    .catch(error => console.error('Error loading JSON data:', error));\n});\n\n// Event listeners for control bar buttons\ndocument.getElementById('backupButton').addEventListener('click', function () {\n  console.log('Backup button clicked');\n  // Implement backup functionality here\n});\n\ndocument.getElementById('renameButton').addEventListener('click', function () {\n  console.log('Rename button clicked');\n  // Implement rename functionality here\n});\n\ndocument.getElementById('undoButton').addEventListener('click', function () {\n  console.log('Undo button clicked');\n  // Implement undo functionality here\n});\n\n//# sourceURL=webpack://util_js_bmfr_no_extens1/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;