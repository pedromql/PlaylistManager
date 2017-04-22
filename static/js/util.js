/*
 * Get users details from token
 * if token is invalid, erasesCookie
 * when returns is null, you must redirect to login
 * */
function getUserFromToken() {
    var token = readCookie("token");
    var user = null;
    if (token) {
        $.ajax( {
            data: {
                "token":token
            },
            url: "/api/get_user_data",
            method: "GET",
            async: false,
            success: function (result) {
                if (result.success == true) {
                    user = result.result;
                }
                else {
                    eraseCookie("token");
                }
            },
            error: function () {
                user = "serverError";
            }
        });
    }
    return user;
}

function logOut() {
    eraseCookie("token");
    if (urlParams().designacao != null){
        window.location.href = "/?designacao="+urlParams().designacao;
        return;
    }
    window.location.href = "/";
}

function checkPermissions(user) {
    var url = String(window.location.href);
    var folder = url.split("/")[3];
    if (folder == "admin") folder = 0;
    else if (folder == "cra") folder = 1;
    else if (folder == "arbitro") folder = 2;
    if (user == "serverError") {
        window.location.href = "/server-error.html"; //redirect
        return;
    }
    if (user) {
        if (user.tipo_privilegio != folder && !(user.tipo_privilegio==1 && folder == "2")) {
            switch (user.tipo_privilegio) {
                case 2:
                    window.location.href = "/arbitro/responder-pre-convocatoria.html"; //redirect
                    break;
                case 1:
                    window.location.href = "/cra/consultar-informacao-arbitro.html"; //redirect
                    break;
                case 0:
                    window.location.href = "/admin/registar-utilizador.html"; //redirect
                    break;
                default:
                    logOut();
                    break;
            }
        }
    }
    else {
        logOut();
    }
}

function isEmail(email) {
    var regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return regex.test(email);
}

function goToByScroll(id){
    id = $("#"+id);
    $('html,body').animate({
        scrollTop: id.offset().top - ( $(window).height() - id.outerHeight(true) ) / 2
    }, 'slow');
}

function urlParams() {
    var params = {};

    if (location.search) {
        var parts = location.search.substring(1).split('&');

        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=');
            if (!nv[0]) continue;
            params[nv[0]] = nv[1] || true;
        }
    }

    return params;
}

function changeAlertBanner(id, strong, mensagem, tipo) {
    banner = $("#"+id);
    banner.hide();
    banner.removeClass("alert-success alert-danger alert-info alert-warning");
    banner.html("");
    if (tipo == "success") {
        banner.addClass("alert-success");
        if (strong != "") {
            banner.html("<strong>"+strong+" </strong>"+mensagem);
        }
        else {
            banner.html(mensagem);
        }
    }
    else if (tipo == "error") {
        banner.addClass("alert-danger");
        if (strong != "") {
            banner.html("<strong>"+strong+" </strong>"+mensagem);
        }
        else {
            banner.html(mensagem);
        }
    }
    else if (tipo == "loading") {
        banner.addClass("alert-info");
        banner.html("<i class='fa fa-spinner fa-spin' style='font-size:24px; margin-right: 20px;'></i><strong>A carregar!</strong>");
    }
    else {
        banner.addClass("alert-warning");
        if (strong != "") {
            banner.html("<strong>"+strong+" </strong>"+mensagem);
        }
        else {
            banner.html(mensagem);
        }
    }
    banner.show();
    goToByScroll(id);
}

function hideBanner(id) {
    banner = $("#"+id);
    banner.hide();
    banner.removeClass("alert-success alert-danger alert-info alert-warning");
    banner.html("");
}
