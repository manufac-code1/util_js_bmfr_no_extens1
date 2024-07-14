module.exports = {
  forbidden: [
    {
      name: "not-to-test",
      severity: "error",
      comment: "Don't allow dependencies from outside tests to tests",
      from: { pathNot: "^(test|spec)" },
      to: { path: "^(test|spec)" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules|libs|src/mod2State.js|src/mod1ConfigBasic.js|src/mod9Index_offload.js|data|index.css",
    },
    exclude: {
      path: "node_modules|libs|src/mod2State.js|src/mod1ConfigBasic.js|src/mod9Index_offload.js|data|index.css",
    },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};
