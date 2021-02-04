$(document).ready(function () {
  $(document).on("click", "#toggle-sidebar", function (event) {
    $(".sidebar").addClass("open");
    $(".overlay").addClass("open");
  });
  $(document).on("click", ".overlay, .sidebar ul li a.link", function (event) {
    $(".sidebar").removeClass("open");
    $(".overlay").removeClass("open");
  });
});
