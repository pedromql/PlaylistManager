$( document ).ready(function() {

    $( "#registo-form" ).submit(function( event ) {
    	var form_data = new FormData();
    	if ($('#fileinput')[0].files.length > 0) {
    	    form_data.append("file", $('#fileinput')[0].files[0]);
    	}

    	form_data.append("token", "oVMN3iFYTjfJGGY3mVGKUeKvSbgwJMA1TU15c25Y7aUmBAjXEr");
        form_data.append("title", "lost on you");
        form_data.append("artist","lp");
        form_data.append("album","lp");
        form_data.append("year","2016");


        


        //formData = JSON.stringify(form_data.serializeArray());
    
    	$.ajax({
                data: form_data,
                url: "http://localhost:8080/api/song/create",
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


