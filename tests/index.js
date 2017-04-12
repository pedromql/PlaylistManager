$( document ).ready(function() {

    $( "#registo-form" ).submit(function( event ) {
    	var form_data = new FormData();
    	if ($('#fileinput')[0].files.length > 0) {
    	    form_data.append("file", $('#fileinput')[0].files[0]);
    	}

    	form_data.append("token", "teste do crl");
        form_data.append("title", "merda para isto");
        form_data.append("path","/test/banan.mp3");
        form_data.append("artist","banan player");
        form_data.append("album","banan player");
        form_data.append("release","banan player");
        form_data.append("year","2000");


        


        //formData = JSON.stringify(form_data.serializeArray());
    
    	$.ajax({
                data: form_data,
                url: "http://localhost:8080/api/song/upload",
                method: "POST",
                contentType: false,
                cache: false,
                processData: false,
                success: function(result) {
                    if (result.success == true) {
    			alert("success");
                    }
                    else {
                        	alert("not success");
                    }
                    console.log(result);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                  //  alert("error");
                }
            });

       /* $.ajax({
                data: form_data,
                url: "http://localhost:8080/api/song/upload",
                method: "POST",
                contentType: "application/json",
                dataType: "json",
                cache: false,
                processData: false,
                success: function(result) {
                    if (result.success == true) {
                alert("success");
                    }
                    else {
                            alert("not success");
                    }
                    console.log(result);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("error");
                }
            });
*/
    });

});


