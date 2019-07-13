<?php
/**
 * Zakra helper functions.
 *
 * @package zakra
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'zakra_is_woocommerce_active' ) ) :
	/**
	 * Check if WooCommerce plugin is active.
	 */
	function zakra_is_woocommerce_active() {

		if ( in_array( 'woocommerce/woocommerce.php', get_option( 'active_plugins' ), true ) ) {
			return true;
		} else {
			return false;
		}

	}
endif;

if ( ! function_exists( 'zakra_is_header_transparent_enabled' ) ) :
	/**
	 * Check if header transparent is enabled.
	 */
	function zakra_is_header_transparent_enabled() {

		$result = intval( get_post_meta( get_the_ID(), 'zakra_transparent_header', true ) );

		if ( empty( $result ) && 0 === $result ) {
			return false;
		}

		return apply_filters( 'zakra_header_transparency_enable', true );

	}
endif;

if ( ! function_exists( 'zakra_is_page_title_enabled' ) ) :
	/**
	 * Check if page header is enabled.
	 */
	function zakra_is_page_title_enabled() {

		$result = get_theme_mod( 'zakra_page_title_enabled', 'page-header' );

		// If invalid: return default.
		if ( ! in_array( $result, array( 'page-header', 'content-area' ) ) ) {
			return 'page-header';
		}

		return apply_filters( 'zakra_page_title_enabled', $result );

	}
endif;

if ( ! function_exists( 'zakra_is_breadcrumbs_enabled' ) ) :

	/**
	 * Check if breadcrumbs is enabled.
	 */
	function zakra_is_breadcrumbs_enabled() {

		// Return false if disabled via Customizer.
		$result = get_theme_mod( 'zakra_breadcrumbs_enabled', true );

		// If invalid: return default.
		if ( ! is_bool( $result ) ) {
			return true;
		}

		return apply_filters( 'zakra_breadcrumbs_enabled', $result );

	}

endif;

if ( ! function_exists( 'zakra_footer_copyright' ) ) :

	/**
	 * Get Copyright text.
	 */
	function zakra_footer_copyright() {
		$site_link  = '<a href="' . esc_url( home_url( '/' ) ) . '" title="' . esc_attr( get_bloginfo( 'name', 'display' ) ) . '" >' . get_bloginfo( 'name', 'display' ) . '</a>';
		$theme_link = '<a href="https://themegrill.com/themes/zakra" target="_blank" title="' . esc_attr__( 'Zakra', 'zakra' ) . '" rel="author">' . __( 'Zakra', 'zakra' ) . '</a>';

		/* translators: 1: Current Year, 2: Site Name, 3: Theme Name. */
		$footer_copyright = sprintf( esc_html__( 'Copyright &copy; %1$s %2$s. Theme: %3$s By ThemeGrill.', 'zakra' ), esc_attr( date( 'Y' ) ), $site_link, $theme_link );

		return $footer_copyright;
	}

endif;

if ( ! function_exists( 'zakra_search_icon_menu_item' ) ) :

	/**
	 * Renders search icon menu item.
	 */
	function zakra_search_icon_menu_item() {
		$output = '';

		if ( true === get_theme_mod( 'tg_header_menu_search_enabled', true ) ) :
			$output  = '<li class="menu-item tg-menu-item tg-menu-item-search">';
			$output .= '<a><i class="tg-icon tg-icon-search"></i></a>';
			$output .= get_search_form( false );
			$output .= '</li>';
			$output .= '<!-- /.tg-header-search -->';
		endif;

		return $output;
	}

endif;

if ( ! function_exists( 'zakra_get_layout_type' ) ) :

	/**
	 * Get layout type.
	 *
	 * @return string A layout type.
	 */
	function zakra_get_layout_type() {

		global $post;
		$layout = 'tg-site-layout--right'; // Set default.

		if ( $post ) {

			// Meta value.
			$layout_meta_arr = get_post_meta( $post->ID, 'zakra_layout' );
			$layout_meta     = isset( $layout_meta_arr[0] ) ? $layout_meta_arr[0] : 'tg-site-layout--customizer';

			// Get layout from Customizer.
			if ( 'tg-site-layout--customizer' === $layout_meta ) {
				if ( is_single() ) {
					$layout = get_theme_mod( 'zakra_structure_post', 'tg-site-layout--right' );
				} elseif ( is_page() ) {
					$layout = get_theme_mod( 'zakra_structure_page', 'tg-site-layout--right' );
				} elseif ( is_archive() ) {
					$layout = get_theme_mod( 'zakra_structure_archive', 'tg-site-layout--right' );
				} else {
					$layout = get_theme_mod( 'zakra_structure_default', 'tg-site-layout--right' );
				}
			} else { // Get layout from Meta box.
				$layout = $layout_meta;
			}
		}

		return $layout;

	}

endif;
