<?php
/**
 * Zakra content area functions to be hooked.
 *
 * @package zakra
 */

if ( ! function_exists( 'zakra_posts_navigation' ) ) :
	/**
	 * Archive navigation.
	 */
	function zakra_posts_navigation() {

		the_posts_navigation();

	}
endif;

if ( ! function_exists( 'zakra_post_navigation' ) ) :
	/**
	 * Archive navigation.
	 */
	function zakra_post_navigation() {

		the_post_navigation();

	}
endif;
