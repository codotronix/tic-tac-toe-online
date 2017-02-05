$(function(){
	$(window).on('resize', adjustSizes);

	init();


	function init () {
		adjustSizes();
	}

	function adjustSizes () {
		$('.cell').height($('.cell').width());
		$('.sign').css('font-size', $('.cell-inner').height());
	}
})