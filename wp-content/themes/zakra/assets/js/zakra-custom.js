/* Only run scrips when the page is fully loaded */
document.addEventListener( 'DOMContentLoaded', function() {
	function mobileNavigation() {
		var menu           = document.getElementById( 'mobile-navigation' ),
			toggleButton = document.querySelector( '.tg-mobile-toggle' ),
			overlayWrapper = document.querySelector( '.tg-overlay-wrapper' ),
			listItems,
			listItem,
			subMenuButton,
			subMenuToggle,
			closeButton,
			i;

		if ( menu ) {
			listItems = menu.querySelectorAll(
				'li.page_item_has_children, li.menu-item-has-children'
			);
		}

		// Create close icon element.
		closeButton = document.createElement( 'span' );
		closeButton.classList.add( 'tg-mobile-navigation-close' );

		/* Toggle mobile menu */
		if ( toggleButton && menu ) {
			closeButton.addEventListener( 'click', function() {
				toggleButton.click();
			} );

			toggleButton.addEventListener( 'click', function() {
				this.classList.toggle( 'tg-mobile-toggle--opened' );
				menu.classList.toggle( 'tg-mobile-navigation--opened' );

				if ( overlayWrapper ) {
					overlayWrapper.classList.toggle( 'overlay-show' );
				}

				// Mobile menu close button.
				if ( ! menu.getElementsByClassName( 'tg-mobile-navigation-close' ).length ) {
					// Append the close icon before menu.
					menu.appendChild( closeButton );
				}


			} );
		}

		// close menu when clicked outside
		if ( overlayWrapper ) {
			overlayWrapper.addEventListener( 'click', function() {
				this.classList.toggle( 'overlay-show' );
				toggleButton.classList.toggle( 'tg-mobile-toggle--opened' );
				menu.classList.toggle( 'tg-mobile-navigation--opened' );
			} );
		}

		/* Sub Menu toggle */
		if ( listItems ) {
			for ( i = 0; i < listItems.length; i++ ) {

                /* Add submenu toggle button */
                subMenuButton = document.createElement( 'span' );
                subMenuButton.classList.add( 'tg-submenu-toggle' );

                listItem = listItems[i];
                listItem.appendChild( subMenuButton );

                /* Select the subMenutoggle */
                subMenuToggle = listItem.querySelector( '.tg-submenu-toggle' );

				if ( null !== subMenuToggle ) {
					subMenuToggle.addEventListener( 'click', function( e ) {
						e.preventDefault();
						this.parentNode.classList.toggle( 'submenu--show' );
					} );
				}
			}
		}
	}

	/**
	 * Scroll to top button.
	 */
	function scrollToTop() {
		var scrollToTopButton = document.getElementById( 'tg-scroll-to-top' );

		/* Only proceed when the button is present. */
		if ( scrollToTopButton ) {

			/* On scroll and show and hide button. */
			window.addEventListener( 'scroll', function() {
				if ( 500 < window.scrollY ) {
					scrollToTopButton.classList.add( 'tg-scroll-to-top--show' );
				} else if ( 500 > window.scrollY ) {
					scrollToTopButton.classList.remove(
						'tg-scroll-to-top--show'
					);
				}
			} );

			/* Scroll to top when clicked on button. */
			scrollToTopButton.addEventListener( 'click', function( e ) {
				e.preventDefault();

				/* Only scroll to top if we are not in top */
				if ( 0 !== window.scrollY ) {
					window.scrollTo( {
						top: 0,
						behavior: 'smooth'
					} );
				}
			} );
		}
	}

	mobileNavigation();
	scrollToTop();

	/**
	 * Search form.
	 */
	(
		function() {
			var searchIcon, searchBox;

			searchIcon = document.querySelector( '.tg-menu-item-search .tg-icon-search' );
			searchBox  = document.getElementsByClassName( 'tg-menu-item-search' )[0];

			/**
			 * Show hide search form.
			 */
			function showHideSearchForm( action ) {

				// Hide search form.
				if ( 'hide' === action ) {
					searchBox.classList.remove( 'show-search' );
					return;
				}

				// Toggle search form.
				searchBox.classList.toggle( 'show-search' );

				// autofocus
				if ( searchBox.classList.contains( 'show-search' ) ) {
					searchBox.getElementsByTagName( 'input' )[0].focus();
				}
			}

			// If icon exists.
			if ( null !== searchIcon ) {

				// on search icon click.
				searchIcon.addEventListener( 'click', function( ev ) {
					ev.preventDefault();
					showHideSearchForm();
				} );

				// on click outside form.
				document.addEventListener( 'click', function( ev ) {
					if ( ev.target.closest( '.tg-menu-item-search' ) || ev.target.closest( '.tg-icon-search' ) ) {
						return;
					}
					showHideSearchForm( 'hide' );
				} );

				// on esc key.
				document.addEventListener( 'keyup', function( e ) {
					if ( searchBox.classList.contains( 'show-search' ) && 27 === e.keyCode ) {
						showHideSearchForm( 'hide' );
					}
				} );

			}
		}()
	);

} );
