console.log('test 123')
    
    $(document).ready(function(){
        $('.multiple-items').slick({
            dots: true,
            arrows: true,
            infinite: false,
            speed: 300,
            slidesToShow: 6,
            slidesToScroll: 6,
            responsive: [
                {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
                },
                {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
                },
                {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
                }
            ]
            });
        });
