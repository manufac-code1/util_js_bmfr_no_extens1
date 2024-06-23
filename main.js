$(document).ready(function () {
  $.ajax({
    url: "data/specific_node_33645.json",
    dataType: "json",
    success: function (data) {
      // Initialize jsTree with the fetched data
      $("#bookmarkTree").jstree({
        core: {
          data: data,
        },
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error loading JSON data: ", textStatus, errorThrown);
    },
  });
});
