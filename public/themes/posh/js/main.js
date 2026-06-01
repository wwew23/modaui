(function($) {
    "use strict";
  
    const $documentOn = $(document);
    const $windowOn = $(window);
  
    $documentOn.ready( function() {
  
      /* ================================
       Mobile Menu Js Start
    ================================ */
    
      $('#mobile-menu').meanmenu({
        meanMenuContainer: '.mobile-menu',
        meanScreenWidth: "1199",
        meanExpand: ['<i class="far fa-plus"></i>'],
    });

       $('#mobile-menus').meanmenu({
        meanMenuContainer: '.mobile-menus',
        meanScreenWidth: "19920",
        meanExpand: ['<i class="far fa-plus"></i>'],
    });

     $documentOn.on("click", ".mean-expand", function () {
        let icon = $(this).find("i");

        if (icon.hasClass("fa-plus")) {
            icon.removeClass("fa-plus").addClass("fa-minus"); 
        } else {
            icon.removeClass("fa-minus").addClass("fa-plus"); 
        }
    });

    /* ================================
        Sidebar Toggle & Sticky Item Logic
        ================================ */

        // Open offcanvas
        $(".sidebar__toggle").on("click", function () {
        $(".offcanvas__info").addClass("info-open");
        $(".offcanvas__overlay").addClass("overlay-open");

        // Hide sticky item
        $(".sidebar-sticky-item").fadeOut().removeClass("active");
        });

        // Close offcanvas
        $(".offcanvas__close, .offcanvas__overlay").on("click", function () {
        $(".offcanvas__info").removeClass("info-open");
        $(".offcanvas__overlay").removeClass("overlay-open");

        // Show sticky item
        $(".sidebar-sticky-item").fadeIn().addClass("active");
        });

        /* ================================
        Body Overlay Js Start
        ================================ */

        $(".body-overlay").on("click", function () {
        $(".offcanvas__area").removeClass("offcanvas-opened");
        $(".df-search-area").removeClass("opened");
        $(".body-overlay").removeClass("opened");

        // Show sticky item when overlay clicked
        $(".sidebar-sticky-item").fadeIn().addClass("active");
        });

        /* ================================
        Offcanvas Link Click (Optional)
        ================================ */

        $(".offcanvas a").on("click", function () {
        $(".sidebar-sticky-item").fadeIn().addClass("active");
    });

    
      /* ================================
       Sticky Header Js Start
    ================================ */

       $windowOn.on("scroll", function () {
        if ($(this).scrollTop() > 250) {
          $("#header-sticky").addClass("sticky");
        } else {
          $("#header-sticky").removeClass("sticky");
        }
      });      
      
       /* ================================
       Video & Image Popup Js Start
    ================================ */

      $(".img-popup").magnificPopup({
        type: "image",
        gallery: {
          enabled: true,
        },
      });

      $(".video-popup").magnificPopup({
        type: "iframe",
        callbacks: {},
      });
  
      /* ================================
       Counterup Js Start
    ================================ */

      $(".count").counterUp({
        delay: 15,
        time: 4000,
      });
  
      /* ================================
       Wow Animation Js Start
    ================================ */

      new WOW().init();
  
      /* ================================
       Nice Select Js Start
    ================================ */

    if ($('.single-select').length) {
        $('.single-select').niceSelect();
    }

    //>> Nice Select Start <<//
        $('select').niceSelect();

      /* ================================
       Parallaxie Js Start
    ================================ */

      if ($('.parallaxie').length && $(window).width() > 991) {
          if ($(window).width() > 768) {
              $('.parallaxie').parallaxie({
                  speed: 0.55,
                  offset: 0,
              });
          }
      }

      /* ================================
      Hover Active Js Start
    ================================ */

    // $(".").hover(
	// 	// Function to run when the mouse enters the element
	// 	function () {
	// 		// Remove the "active" class from all elements
	// 		$(".").removeClass("active");
	// 		// Add the "active" class to the currently hovered element
	// 		$(this).addClass("active");
	// 	}
	// );

    /* ================================
        Mouse Cursor Animation Js Start
    ================================ */

    if ($(".mouseCursor").length > 0) {
        function itCursor() {
            var myCursor = jQuery(".mouseCursor");
            if (myCursor.length) {
                if ($("body")) {
                    const e = document.querySelector(".cursor-inner"),
                        t = document.querySelector(".cursor-outer");
                    let n, i = 0, o = !1;
                    window.onmousemove = function(s) {
                        if (!o) {
                            t.style.transform = "translate(" + s.clientX + "px, " + s.clientY + "px)";
                        }
                        e.style.transform = "translate(" + s.clientX + "px, " + s.clientY + "px)";
                        n = s.clientY;
                        i = s.clientX;
                    };
                    $("body").on("mouseenter", "button, a, .cursor-pointer", function() {
                        e.classList.add("cursor-hover");
                        t.classList.add("cursor-hover");
                    });
                    $("body").on("mouseleave", "button, a, .cursor-pointer", function() {
                        if (!($(this).is("a", "button") && $(this).closest(".cursor-pointer").length)) {
                            e.classList.remove("cursor-hover");
                            t.classList.remove("cursor-hover");
                        }
                    });
                    e.style.visibility = "visible";
                    t.style.visibility = "visible";
                }
            }
        }
        itCursor();
    }

    /* ================================
        Back To Top Button Js Start
    ================================ */
    $windowOn.on('scroll', function() {
        var windowScrollTop = $(this).scrollTop();
        var windowHeight = $(window).height();
        var documentHeight = $(document).height();

        if (windowScrollTop + windowHeight >= documentHeight - 10) {
            $("#back-top").addClass("show");
        } else {
            $("#back-top").removeClass("show");
        }
    });

    $documentOn.on('click', '#back-top', function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

    /* ================================
      Brand Slider Js Start
    ================================ */

   if ($('.brand-slider').length > 0) {
    const brandSlider = new Swiper(".brand-slider", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        breakpoints: {
            1199: {
                slidesPerView: 5,
            },
            991: {
                slidesPerView: 4.5,
            },
            767: {
                slidesPerView: 3.3,
            },
            575: {
                slidesPerView: 2,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

    /* ================================
      Shop Slider Js Start
    ================================ */

   if ($('.shop-slider').length > 0) {
    const shopSlider = new Swiper(".shop-slider", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
         pagination: {
                el: ".dot",
                clickable: true,
            },
        breakpoints: {
            1199: {
                slidesPerView: 4,
            },
            991: {
                slidesPerView: 3,
            },
            767: {
                slidesPerView: 2,
            },
            575: {
                slidesPerView: 1.5,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

   if ($('.shop-slider-3').length > 0) {
    const shopSlider3 = new Swiper(".shop-slider-3", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
         pagination: {
                el: ".dot",
                clickable: true,
            },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 3,
            },
            767: {
                slidesPerView: 2,
            },
            575: {
                slidesPerView: 1.5,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

    if ($('.shop-slider-4').length > 0) {
    const shopSlider4 = new Swiper(".shop-slider-4", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
         pagination: {
                el: ".dot",
                clickable: true,
            },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 2,
            },
            767: {
                slidesPerView: 2,
            },
            575: {
                slidesPerView: 1.5,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

   if ($('.shop-slider-6').length > 0) {
    const shopSlider6 = new Swiper(".shop-slider-6", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            1199: {
                slidesPerView: 2,
            },
            991: {
                slidesPerView: 1,
            },
            767: {
                slidesPerView: 1,
            },
            575: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   const dots = document.querySelectorAll('.dot-num');

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        shopSlider6.slideToLoop(index);
    });
});

shopSlider6.on('slideChange', () => {
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === shopSlider6.realIndex);
    });
});

// initial active state
dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === shopSlider6.realIndex);
});

   }

   if ($('.shop-category-slider-3').length > 0) {
    const shopCategorySlider3 = new Swiper(".shop-category-slider-3", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
         pagination: {
            el: ".dot5",
            clickable: true,
        },
        breakpoints: {
            1399: {
                slidesPerView: 6,
            },
            1199: {
                slidesPerView: 5,
            },
            991: {
                slidesPerView: 4,
            },
            767: {
                slidesPerView: 3,
            },
            575: {
                slidesPerView: 2,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

   if ($('.shop-category-slider-4').length > 0) {
    const shopCategorySlider4 = new Swiper(".shop-category-slider-4", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        breakpoints: {
            1199: {
                slidesPerView: 4,
            },
            991: {
                slidesPerView: 3,
            },
            767: {
                slidesPerView: 2,
            },
            575: {
                slidesPerView: 1.4,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

    /* ================================
      Testimonial Slider Js Start
    ================================ */

   if ($('.testimonial-slider').length > 0) {
    const testimonialSlider = new Swiper(".testimonial-slider", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dot2",
            clickable: true,
        },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 2,
            },
            767: {
                slidesPerView: 1.5,
            },
            575: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

    if ($('.testimonial-slider-2').length > 0) {
    const testimonialSlider2 = new Swiper(".testimonial-slider-2", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dot3",
            clickable: true,
        },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 2,
            },
            767: {
                slidesPerView: 1.5,
            },
            575: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

    if ($('.testimonial-slider-3').length > 0) {
    const testimonialSlider3 = new Swiper(".testimonial-slider-3", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dot6",
            clickable: true,
        },
        breakpoints: {
            1199: {
                slidesPerView: 4,
            },
            991: {
                slidesPerView: 2,
            },
            767: {
                slidesPerView: 1.5,
            },
            575: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

     if ($('.testimonial-slider-4').length > 0) {
    const testimonialSlider4 = new Swiper(".testimonial-slider-4", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dots",
            clickable: true,
        },
    });
   }

   if ($('.team-slider').length > 0) {
    const teamSlider = new Swiper(".team-slider", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dot3",
            clickable: true,
        },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 2,
            },
            767: {
                slidesPerView: 1.5,
            },
            575: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

/* ================================
       Instagram Slider Js Start
    ================================ */

    if($('.gt-instagram-slider').length > 0) {
        const gtInstagramSlider = new Swiper(".gt-instagram-slider", {
            spaceBetween: 0,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },

            breakpoints: {
                1399: {
                    slidesPerView: 6,
                },
                1199: {
                    slidesPerView: 5,
                },
                991: {
                    slidesPerView: 4,
                },
                767: {
                    slidesPerView: 3,
                },
                575: {
                    slidesPerView: 2,
                },
                0: {
                    slidesPerView: 1.3,
                },
            },
        });
    }

     if($('.gt-instagram-slider3').length > 0) {
        const gtInstagramSlider3 = new Swiper(".gt-instagram-slider3", {
            spaceBetween: 20,
            speed: 1300,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },

            breakpoints: {
                1199: {
                    slidesPerView: 5,
                },
                991: {
                    slidesPerView: 4,
                },
                767: {
                    slidesPerView: 3,
                },
                575: {
                    slidesPerView: 2,
                },
                0: {
                    slidesPerView: 1.3,
                },
            },
        });
    }

    /* ================================
      Custom Accordion Js Start
    ================================ */

   if ($('.accordion-box').length) {
        $(".accordion-box").on('click', '.acc-btn', function () {
            var outerBox = $(this).closest('.accordion-box');
            var target = $(this).closest('.accordion');
            var accBtn = $(this);
            var accContent = accBtn.next('.acc-content');

            if (target.hasClass('active-block')) {
                // Already open, so close it
                accBtn.removeClass('active');
                target.removeClass('active-block');
                accContent.slideUp(300);
            } else {
                // Close all others
                outerBox.find('.accordion').removeClass('active-block');
                outerBox.find('.acc-btn').removeClass('active');
                outerBox.find('.acc-content').slideUp(300);

                // Open clicked one
                accBtn.addClass('active');
                target.addClass('active-block');
                accContent.slideDown(300);
            }
        });
    }

    // 04. Common Js
		$("[data-background]").each(function () {
			$(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
		});
		$("[data-mask-img]").each(function () {
			$(this).css("-webkit-mask-image", "url( " + $(this).attr("data-mask-img") + "  )");
		});

		$("[data-width], [data-height]").each(function () {
			const $this = $(this);
			
			// Set the width if data-width is present
			if ($this.attr("data-width")) {
					$this.css("width", $this.attr("data-width"));
			}
	
			// Set the height if data-height is present
			if ($this.attr("data-height")) {
					$this.css("height", $this.attr("data-height"));
			}
		});
	

		$("[data-bg-color]").each(function () {
			$(this).css("background-color", $(this).attr("data-bg-color"));
		});

		$("[data-text-color]").each(function () {
			$(this).css("color", $(this).attr("data-text-color"));
		});


        if ($('#showcase-slider-wrappper').length > 0) {
			// Function to update the active slide
			const updateActiveSlide = () => {
					$('.tp-slider-dot').find('.swiper-pagination-bullet').each(function () {
							if (!$(this).hasClass("swiper-pagination-bullet-active")) {
								handleActiveSlideClick('#trigger-slides .swiper-slide-active');
								handleActiveSlideClick('#trigger-slides .swiper-slide-duplicate-active');
							}
					});
			};
	
			// Function to handle slide click events
			const handleActiveSlideClick = (selector) => {
					$(selector).find('div').first().each(function () {
							if (!$(this).hasClass("active")) {
								$(this).trigger('click');
							}
					});
			};
	
			// WebGL Shader Configuration
			const vertex = `
					varying vec2 vUv;
					void main() {
							vUv = uv;
							gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
			`;
			const fragment = `
					varying vec2 vUv;
					uniform sampler2D currentImage;
					uniform sampler2D nextImage;
					uniform sampler2D disp;
					uniform float dispFactor;
					uniform float effectFactor;
					uniform vec4 resolution;
					void main() {
							vec2 uv = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
							vec4 disp = texture2D(disp, uv);
							vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r * effectFactor), uv.y);
							vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (disp.r * effectFactor), uv.y);
							vec4 _currentImage = texture2D(currentImage, distortedPosition);
							vec4 _nextImage = texture2D(nextImage, distortedPosition2);
							vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);
							gl_FragColor = finalTexture;
					}
			`;
	
			const gl_canvas = new WebGL({
				vertex: vertex,
				fragment: fragment,
			});

			// Add events for the slide triggers
			const addEvents = () => {
				const triggerSlide = Array.from(document.getElementById('trigger-slides').querySelectorAll('.slide-wrap'));
				gl_canvas.isRunning = false;

				triggerSlide.forEach((el) => {
					el.addEventListener('click', function () {
						if (!gl_canvas.isRunning) {
							gl_canvas.isRunning = true;

							document.getElementById('trigger-slides').querySelectorAll('.active')[0].className = '';
							this.className = 'active';

							const slideId = parseInt(this.dataset.slide, 10);

							gl_canvas.material.uniforms.nextImage.value = gl_canvas.textures[slideId];
							gl_canvas.material.uniforms.nextImage.needsUpdate = true;

							gsap.to(gl_canvas.material.uniforms.dispFactor, {
									duration: 1,
									value: 1,
									ease: 'Sine.easeInOut',
									onComplete: function () {
											gl_canvas.material.uniforms.currentImage.value = gl_canvas.textures[slideId];
											gl_canvas.material.uniforms.currentImage.needsUpdate = true;
											gl_canvas.material.uniforms.dispFactor.value = 0.0;
											gl_canvas.isRunning = false;
									},
							});
						}
					});
				});
			};

			// Initialize Swiper
			const showcaseSwiper = new Swiper('#showcase-slider', {
				direction: "horizontal",
				loop: true,
				slidesPerView: 'auto',
				touchStartPreventDefault: false,
				speed: 1000,
				mousewheel: false,
				autoplay: {
					delay: 2000,
				},
				effect: 'fade',
				simulateTouch: true,
				parallax: true,
				navigation: {
					clickable: true,
					prevEl: '.tp-hero-prev',
					nextEl: '.tp-hero-next',
				},
				pagination: {
					el: '.tp-slider-dot',
					clickable: true,
				},
				on: {
					slidePrevTransitionStart: function () {
						updateActiveSlide();
					},
					slideNextTransitionStart: function () {
						updateActiveSlide();
					},
					init: function () {
						updateSlideNumbers(this); // Update numbers on initial load
					},
					slideChange: function () {
						updateSlideNumbers(this); // Update numbers when slide changes
					}
				},
			});

			// Function to update slide numbers
			function updateSlideNumbers(swiper) {
				const current = swiper.realIndex + 1; // Get the real index of the current slide
				const numbers = document.querySelector('.tp-hero-7-slider-numbers');
				const formattedCurrent = current < 10 ? `0${current}` : current; // Add leading zero for single digits
				numbers.innerHTML = `${formattedCurrent}`;
			}

			addEvents();
		}



        /* ================================
       Banner Active Js Start
    ================================ */

       if($('.banner-active').length > 0) {
            const bannerActive = new Swiper(".banner-active", {
                speed:1500,
                loop: true,
                slidesPerView: 1,
                effect:'fade',
                autoplay: {
                    delay: 3000,         
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,  
                },
                navigation: {
                    nextEl: ".array-prev",
                    prevEl: ".array-next",
                },
                pagination: {
                    el: ".hero-dot",
                    clickable: true,
                },
		
            });
        }



    
   /* ================================
        Countdown Js Start
        ================================ */

        let targetDate = new Date("2026-11-29 00:00:00").getTime();
        const countdownInterval = setInterval(function () {
            let currentDate = new Date().getTime();
            let remainingTime = targetDate - currentDate;

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                // Display a message or perform any action when the countdown timer reaches zero
                $("#countdown-container").text("Countdown has ended!");
            } else {
                let days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                let hours = Math.floor(
                    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                let minutes = Math.floor(
                    (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
                );
                let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

                // Pad single-digit values with leading zeros
                $("#day").text(days.toString().padStart(2, "0"));
                $("#hour").text(hours.toString().padStart(2, "0"));
                $("#min").text(minutes.toString().padStart(2, "0"));
                $("#sec").text(seconds.toString().padStart(2, "0"));
            }
        }, 1000);

        /* ================================
       Additional Quantity Controls Js Start
    ================================ */

    const inputs = document.querySelectorAll('#qty, #qty2, #qty3');
    const btnminus = document.querySelectorAll('.qtyminus');
    const btnplus = document.querySelectorAll('.qtyplus');

    if (inputs.length && btnminus.length && btnplus.length) {

        inputs.forEach((input, index) => {
            const min = Number(input.getAttribute('min')) || 1;
            const max = Number(input.getAttribute('max')) || 10;
            const step = Number(input.getAttribute('step')) || 1;

            btnminus[index].addEventListener('click', (e) => {
                e.preventDefault();
                let current = Number(input.value) || min;
                let newval = current - step;

                if (newval < min) newval = min;
                input.value = newval;
            });

            btnplus[index].addEventListener('click', (e) => {
                e.preventDefault();
                let current = Number(input.value) || min;
                let newval = current + step;

                if (newval > max) newval = max;
                input.value = newval;
            });
        });

    }

     const boxes = document.querySelectorAll('.color-box');
    if (!boxes.length) return;

    if (document.body.classList.contains('color-box-init')) return;
    document.body.classList.add('color-box-init');

    boxes.forEach(box => {
        box.addEventListener('click', function () {
        boxes.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        });
    });

  // Range & Input Elements
        const minRange = document.getElementById('min-range');
        const maxRange = document.getElementById('max-range');
        const minInput = document.getElementById('min-input');
        const maxInput = document.getElementById('max-input');

        // Safety check (ThemeForest best practice)
        if (!minRange || !maxRange || !minInput || !maxInput) return;

        // ===============================
        // Slider → Input Sync
        // ===============================
        minRange.addEventListener('input', function () {
            let minVal = parseInt(minRange.value, 10);
            let maxVal = parseInt(maxRange.value, 10);

            if (minVal > maxVal) {
                minVal = maxVal;
                minRange.value = minVal;
            }
            minInput.value = minVal;
        });

        maxRange.addEventListener('input', function () {
            let minVal = parseInt(minRange.value, 10);
            let maxVal = parseInt(maxRange.value, 10);

            if (maxVal < minVal) {
                maxVal = minVal;
                maxRange.value = maxVal;
            }
            maxInput.value = maxVal;
        });

        // ===============================
        // Input → Slider Sync
        // ===============================
        minInput.addEventListener('input', function () {
            let val = parseInt(minInput.value, 10);
            if (!isNaN(val)) minRange.value = val;
        });

        maxInput.addEventListener('input', function () {
            let val = parseInt(maxInput.value, 10);
            if (!isNaN(val)) maxRange.value = val;
        });
       
   
    
    }); // End Document Ready Function

    

      /* ================================
        Quantity Increment/Decrement Js Start
        ================================ */

    const $cartWrapper = $(".shop-cart-wrapper");

    $cartWrapper.on("click", ".plus-btn", function () {
        const $cartItem = $(this).closest(".cart-item");
        const $input = $cartItem.find(".qty-input");
        const qty = parseInt($input.val(), 10) || 1;

        $input.val(qty + 1);
        updateItemTotal($cartItem);
    });

    $cartWrapper.on("click", ".minus-btn", function () {
        const $cartItem = $(this).closest(".cart-item");
        const $input = $cartItem.find(".qty-input");
        const qty = Math.max(1, (parseInt($input.val(), 10) || 1) - 1);

        $input.val(qty);
        updateItemTotal($cartItem);
    });

    $cartWrapper.on("input", ".qty-input", function () {
        const $input = $(this);
        const qty = Math.max(1, parseInt($input.val(), 10) || 1);

        $input.val(qty);
        updateItemTotal($input.closest(".cart-item"));
    });

    /*-----------------------------------
        Update Cart Item Total (Private)
    -----------------------------------*/
    const updateItemTotal = ($cartItem) => {
        const price = parseFloat(
            $cartItem.find(".price").text().replace(/[^0-9.]/g, "")
        ) || 0;

        const qty = parseInt($cartItem.find(".qty-input").val(), 10) || 1;
        $cartItem.find(".product-total").text("$" + (price * qty).toFixed(2));
    };

     /* ================================
        Quantity Increment/Decrement Js Start
        ================================ */
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.qty-box').forEach(function (box) {
                const plusBtn  = box.querySelector('.plus');
                const minusBtn = box.querySelector('.minus');
                const input    = box.querySelector('input');

                if (!plusBtn || !minusBtn || !input) return;

                const min = parseInt(input.getAttribute('min')) || 1;
                const max = parseInt(input.getAttribute('max')) || Infinity;

                plusBtn.addEventListener('click', function () {
                    let value = parseInt(input.value) || min;
                    if (value < max) {
                        input.value = value + 1;
                    }
                });

                minusBtn.addEventListener('click', function () {
                    let value = parseInt(input.value) || min;
                    if (value > min) {
                        input.value = value - 1;
                    }
                });
            });
        });

     /* ================================
       Preloader Js Start
    ================================ */

     function loader() {
        $(window).on('load', function() {
            // Animate loader off screen
            $(".preloader").addClass('loaded');                    
            $(".preloader").delay(600).fadeOut();                       
        });
    }
    loader();


  
  })(jQuery); // End jQuery

