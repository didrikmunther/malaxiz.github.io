$('.open-intro').click(function() {
    $('#intro-wrap').animate({
    //opacity: 1,
    left: '0',
  }, 500, function() {
    // Animation complete.
  });
    $('.open-intro').hide();
    $('.close-intro').show();
});


$('.close-intro').click(function() {
    $('#intro-wrap').animate({
    //opacity: 0.25,
    left: '-426',
  }, 400, function() {
    // Animation complete.
  });
    $('.open-intro').show();
    $('.close-intro').hide();
});