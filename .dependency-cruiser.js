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
      path: "node_modules|libs|data",
    },
    exclude: {
      path: "node_modules|libs|data|index.css",
    },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    babelConfig: {
      parserOpts: {
        plugins: ["dynamicImport"],
      },
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};
