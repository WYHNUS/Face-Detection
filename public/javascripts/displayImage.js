$(document).ready(function() {
	$("#camera-input").change(function(event) {
		if (event.target.files.length == 1 && 
           event.target.files[0].type.indexOf("image/") == 0) {
            $("#image").attr("src", URL.createObjectURL(event.target.files[0]));
        }
	});
})