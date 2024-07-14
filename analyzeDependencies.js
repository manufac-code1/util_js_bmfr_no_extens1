const madge = require("madge");

madge("./src")
  .then((res) => {
    console.log("Circular Dependencies:");
    console.log(res.circular());

    console.log("Detailed Circular Graph:");
    console.log(res.circularGraph());

    console.log("Dependencies of Specific Modules:");
    console.log("mod3aodmSetup.js:", res.depends("./src/mod3aodmSetup.js"));
    console.log("mod4aodmManage.js:", res.depends("./src/mod4aodmManage.js"));
    console.log("mod5jsTreeSetup.js:", res.depends("./src/mod5jsTreeSetup.js"));
    console.log(
      "mod6jsTreeManage.js:",
      res.depends("./src/mod6jsTreeManage.js")
    );
  })
  .catch((err) => {
    console.error("Error:", err);
  });
