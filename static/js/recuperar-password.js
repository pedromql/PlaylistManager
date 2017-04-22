/*
 * Check if token is valid.
 * If it is valid redirect to dashboard
 * else stays in login page
 * */
var user = getUserFromToken();
if (user) {
    switch (user.tipo_privilegio) {
        case 2:
            window.location.href = "arbitro/responder-pre-convocatoria.html"; //redirect
            break;
        case 1:
            window.location.href = "cra/consultar-informacao-arbitro.html"; //redirect
            break;
        case 0:
            window.location.href = "admin/registar-utilizador.html"; //redirect
            break;
    }
}


$( document ).ready(function() {


    $( "#email-form" ).submit(function( event ) {
        $("#error").remove();
        $("#success").remove();

        var email = $("#email").val();
        if (email==null || email==""){
            //alert("Por favor insira email");
            $("#email").parent().removeClass("has-success").removeClass("has-error").addClass("has-error");
            return false;
        }
        if (validateEmail(email)) {
            //alert(email + " Email Enviado");
            $("#email").parent().removeClass("has-success").removeClass("has-error").addClass("has-success");
        } else {
            $("#email").parent().removeClass("has-success").removeClass("has-error").addClass("has-error");
            return false;
            //alert(email + " Email inválido");
        }

        changeAlertBanner("alertBanner","", "", "loading");

        $.ajax({
            data: {
                "email":email
            },
            url: "/api/recuperar_pass",
            method: "POST",
            success: function(result) {
                if (result.success==false){
                    changeAlertBanner("alertBanner","Erro!", result.result, "error");
                }
                else{
                    changeAlertBanner("alertBanner", "", "Verifique o seu email! <a href='/'>Login</a>", "success");
                }
                //alert("handle return here");
                console.log(result);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
                changeAlertBanner("alertBanner","Problemas na ligação ao servidor!", "", "warning");
            }
        });
        event.preventDefault();
    });

});

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
