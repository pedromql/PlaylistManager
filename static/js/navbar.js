var user = getUserFromToken();
checkPermissions(user);

$( document ).ready(function() {

    $("#sidebar-nome").text(user.nome).addClass("info-overflow");

    var tipo_privilegio = user.tipo_privilegio;
    if (tipo_privilegio == 0) folder = "admin";
    else if (tipo_privilegio == 1) folder = "cra";
    else if (tipo_privilegio == 2) folder = "arbitro";

    var url = String(window.location.href);

    var page_name = url.split("/")[4];
    page_name = page_name.split(".")[0];
    page_name = "/" + url.split("/")[3] + "/" + page_name + ".html";

    $.get("/"+folder+"/navbar.html", function(data){
        $(".templatemo-left-nav").children('ul:last-child').append(data);
        var navbar = $('.templatemo-left-nav').children('ul');

        $('a[href*="'+page_name+'"]',navbar).addClass('active').parent().parent().toggleClass("hidden").prev().children().toggleClass("fa-angle-right fa-angle-down");
        $('a[href*="'+page_name+'"]',navbar).attr("href", "#");

        if (folder == "cra") {
            $.get("/arbitro/navbar.html", function(data){
                $(".templatemo-left-nav").children('ul:last-child').append(data);
                var navbar = $('.templatemo-left-nav').children('ul');

                $('a[href*="'+page_name+'"]',navbar).addClass('active').parent().parent().toggleClass("hidden").prev().children().toggleClass("fa-angle-right fa-angle-down");
                $('a[href*="'+page_name+'"]',navbar).attr("href", "#");

                $('.navbar-dropdown').bind("click",function() {
                    $(this).next().toggleClass("hidden");
                    $(this).children().toggleClass("fa-angle-right fa-angle-down");
                    //hide dos lis indivivualmente
                    //$(this).next().children().toggle("hidden");
                });
            });
        }
        else {
            $('.navbar-dropdown').bind("click",function() {
                $(this).next().toggleClass("hidden");
                $(this).children().toggleClass("fa-angle-right fa-angle-down");
                //hide dos lis indivivualmente
                //$(this).next().children().toggle("hidden");
            });
        }






    });



});