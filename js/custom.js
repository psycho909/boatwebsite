$(function(){	
	<!--選單列-->
	$("#navbar").load("/bokyacht/navbar.html"); 
	<!--頁腳-->
	$("#footer").load("/bokyacht/footer.html");
	
});

document.write("<script type=\"text/javascript\" src=\"/bokyacht/js/ekko-lightbox.min.js\"></script>");
//lightbox
$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});	

//回到頂端
jQuery(".gotop").click(function(event){
	//防止链接打开 URL：
	event.preventDefault();
	//go to destination
	jQuery('html,body').animate({scrollTop:0}, 1000,'swing');
});
jQuery(window).scroll(function() {
	if ( jQuery(this).scrollTop() > 300){
		jQuery('.gotop').fadeIn("fast");
	} else {
		jQuery('.gotop').stop().fadeOut("fast");
	}
});		

//menu選擇
var menuActive = function (menuList) {
	setTimeout($(window).load(function(){$(menuList).addClass("active");}), 1000 );
};


//image slider gallery
$('.myGallery>li>a').click(function(event){
	event.preventDefault();
	document["mainImage"].src = $(this).data('url');
});