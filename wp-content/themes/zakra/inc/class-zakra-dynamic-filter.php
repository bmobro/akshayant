<?php
/**
 * Filter array values.
 *
 * @package    ThemeGrill
 * @subpackage Zakra
 * @since      Zakra 1.1.7
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/*========================================== HEADER > HEADER TOP BAR ==========================================*/
if ( ! class_exists( 'Zakra_Dynamic_Filter' ) ) :

	/**
	 * Filter array values.
	 */
	class Zakra_Dynamic_Filter {

		/**
		 * Array of filter name and css classes.
		 *
		 * @since    1.1.7
		 * @access   private
		 * @var      array $css_class_arr Filter tag and class list.
		 */
		private static $css_class_arr = array();

		/**
		 * Get filter tag and class list in Array.
		 *
		 * @since    1.1.7
		 * @access   public
		 *
		 * @return array Filter tag and class list.
		 */
		public static function css_class_list() {

			self::$css_class_arr = array(
				'zakra_header_main_container_class' => array(
					'tg-header-container',
					'tg-container',
					'tg-container--flex',
					'tg-container--flex-center',
					'tg-container--flex-space-between',
				),
				'zakra_header_top_class'            => array(
					'tg-site-header-top',
				),
				'zakra_header_top_container_class'  => array(
					'tg-header-container',
					'tg-container',
					'tg-container--flex',
					'tg-container--flex-center',
				),
				'zakra_page_header_container_class' => array(
					'tg-container',
					'tg-container--flex',
					'tg-container--flex-center',
					'tg-container--flex-space-between',
				),
				'zakra_nav_class'                   => array(
					'main-navigation',
					'tg-primary-menu',
				),
			);

			return self::$css_class_arr;

		}

		/**
		 * Filter the array according to key.
		 *
		 * @since    1.1.7
		 * @access   public
		 *
		 * @param string $tag Filter tag.
		 *
		 * @return array Filter tag and class list.
		 */
		public static function filter_via_tag( $tag ) {

			$css_class = self::css_class_list();

			$filtered = $css_class[ $tag ];

			return $filtered;

		}

	}

endif;
