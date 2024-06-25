/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/createAODM.js":
/*!***************************!*\
  !*** ./src/createAODM.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createAODM: () => (/* binding */ createAODM)\n/* harmony export */ });\n// Updated createAODM.js\nfunction createAODM(data) {\n    console.log('Fetched bookmarks data:', data);\n    if (!data.children || !Array.isArray(data.children)) {\n        console.error('Top level object does not have children property', data);\n        return;\n    }\n\n    const AODM = [];\n    const dictionaryMap = {};\n\n    function traverseAndBuild(node) {\n        const nodeCopy = { ...node };\n        if (node.children && Array.isArray(node.children)) {\n            nodeCopy.children = [];\n            node.children.forEach(child => {\n                const childCopy = traverseAndBuild(child);\n                nodeCopy.children.push(childCopy);\n            });\n        }\n        dictionaryMap[node.id] = nodeCopy;\n        return nodeCopy;\n    }\n\n    data.children.forEach(node => {\n        const nodeCopy = traverseAndBuild(node);\n        AODM.push(nodeCopy);\n    });\n\n    console.log('AODM created:', AODM);\n    console.log('Dictionary Map created:', dictionaryMap);\n\n    return { AODM, dictionaryMap };\n}\n\n//# sourceURL=webpack://util_js_bmfr_no_extens1/./src/createAODM.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/createAODM.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;