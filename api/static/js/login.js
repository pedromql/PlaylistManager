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

    /*
    * Process login event
    * If success redirect to dashboard
    * Else warns user
    * */
    $( "#login-form" ).submit(function( event ) {

        $("#error").remove();

        var email = $("#email").val();
        var password = $("#password").val();
        password = md5(password);
        var remember_me = $("#remember-me")[0].checked;

        changeAlertBanner("alertBanner","", "", "loading");

        $.ajax({
            data: {
                "email":email,
                "password":password
            },
            url: "/api/login",
            method: "POST",
            success: function(result) {
                //result = JSON.parse(result);
                if (result.success == false) {
                    $("#email").parent().addClass("has-error");
                    $("#password").parent().addClass("has-error");
                    changeAlertBanner("alertBanner","Erro!", result.result, "error");
                }
                else {
                    hideBanner("alertBanner");
                    if (remember_me == true) {
                        createCookie("token",result.token,(365*5));
                    }
                    else {
                        createCookie("token",result.token,null);
                    }

                    if (urlParams().designacao != null){
                        window.location.href = "arbitro/responder-pre-convocatoria.html?designacao="+urlParams().designacao;
                        return;
                    }

                    switch (result.tipo_privilegio) {
                        case 2:
                            if (result.login_flag) window.location.href = "/arbitro/alterar-informacoes-pessoais.html?firstLogin=true"; //redirect
                            else window.location.href = "/arbitro/responder-pre-convocatoria.html";
                            break;
                        case 1:
                            if (result.login_flag) window.location.href = "/arbitro/alterar-informacoes-pessoais.html?firstLogin=true"; //redirect
                            else window.location.href = "/cra/consultar-informacao-arbitro.html";
                            break;
                        case 0:
                            window.location.href = "/admin/registar-utilizador.html"; //redirect
                            break;
                        default:
                            break;
                    }
                }
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
