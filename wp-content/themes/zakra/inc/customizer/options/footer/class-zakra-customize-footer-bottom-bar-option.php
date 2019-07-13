<?php
/**
 * Footer bottom bar options.
 *
 * @package     zakra
 */

defined( 'ABSPATH' ) || exit;

/*========================================== FOOTER > FOOTER  BAR ==========================================*/
if ( ! class_exists( 'Zakra_Customize_Footer_Bottom_Bar_Option' ) ) :

	/**
	 * Footer option.
	 */
	class Zakra_Customize_Footer_Bottom_Bar_Option extends Zakra_Customize_Base_Option {

		/**
		 * Arguments for options.
		 *
		 * @return array
		 */
		public function elements() {

			return array(

				/**
				 * Option:  Style.
				 */
				'zakra_footer_bar_style'            => array(
					'setting' => array(
						'default'           => 'tg-site-footer-bar--center',
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_radio' ),
					),
					'control' => array(
						'type'     => 'radio_image',
						'priority' => 10,
						'label'    => esc_html__( 'Style', 'zakra' ),
						'section'  => 'zakra_footer_bottom_bar',
						'choices'  => apply_filters( 'zakra_footer_bar_style_choices', array(
							'tg-site-footer-bar--left'   => ZAKRA_PARENT_INC_ICON_URI . '/footer-left.png',
							'tg-site-footer-bar--center' => ZAKRA_PARENT_INC_ICON_URI . '/footer-center.png',
						) ),
					),
				),

				/* ============================== Left Content ============================== */

				/**
				 * Option: Left content.
				 */
				'zakra_footer_bar_section_one'      => array(
					'setting' => array(
						'default'           => 'text_html',
						'sanitize_callback' => 'wp_kses_post',
					),
					'control' => array(
						'type'            => 'select',
						'priority'        => 12,
						'is_default_type' => true,
						'label'           => esc_html__( 'Left Content', 'zakra' ),
						'section'         => 'zakra_footer_bottom_bar',
						'choices'         => apply_filters( 'zakra_footer_bar_section_one_choices', array(
							'none'      => esc_html__( 'None', 'zakra' ),
							'text_html' => esc_html__( 'Text/HTML', 'zakra' ),
							'menu'      => esc_html__( 'Menu', 'zakra' ),
							'widget'    => esc_html__( 'Widget', 'zakra' ),
						) ),
					),
				),

				/**
				 * Option: Left content > Text/HTML for Left Content.
				 */
				'zakra_footer_bar_section_one_html' => array(
					'setting' => array(
						'default'           => zakra_footer_copyright(),
						'sanitize_callback' => 'wp_kses_post',
					),
					'control' => array(
						'type'            => 'editor',
						'priority'        => 14,
						'label'           => esc_html__( 'Text/HTML for Left Content', 'zakra' ),
						'section'         => 'zakra_footer_bottom_bar',
						'active_callback' => array(
							array(
								'setting'  => 'zakra_footer_bar_section_one',
								'operator' => '==',
								'value'    => 'text_html',
							),
						),
					),
				),

				/**
				 * Option: Left content > Menu content.
				 */
				'zakra_footer_bar_section_one_menu' => array(
					'setting' => array(
						'default' => 'none',

					),
					'control' => array(
						'type'            => 'select',
						'priority'        => 16,
						'is_default_type' => true,
						'label'           => esc_html__( 'Select a Menu for Left Content', 'zakra' ),
						'section'         => 'zakra_footer_bottom_bar',
						'choices'         => $this->get_menu_options(),
						'active_callback' => array(
							array(
								'setting'  => 'zakra_footer_bar_section_one',
								'operator' => '==',
								'value'    => 'menu',
							),
						),

					),
				),

				/* ============================== Right Content ============================== */

				/**
				 * Option: Right Content.
				 */
				'zakra_footer_bar_section_two'      => array(
					'setting' => array(
						'default'           => 'none',
						'sanitize_callback' => 'wp_kses_post',
					),
					'control' => array(
						'type'            => 'select',
						'priority'        => 20,
						'is_default_type' => true,
						'label'           => esc_html__( 'Right Content', 'zakra' ),
						'section'         => 'zakra_footer_bottom_bar',
						'choices'         => apply_filters( 'zakra_footer_bar_section_two_choices', array(
							'none'      => esc_html__( 'None', 'zakra' ),
							'text_html' => esc_html__( 'Text/HTML', 'zakra' ),
							'menu'      => esc_html__( 'Menu', 'zakra' ),
							'widget'    => esc_html__( 'Widget', 'zakra' ),
						) ),
					),
				),

				/**
				 * Option: Right content > Text/HTML for Right Content.
				 */
				'zakra_footer_bar_section_two_html' => array(
					'setting' => array(
						'default'           => '',
						'sanitize_callback' => 'wp_kses_post',
					),
					'control' => array(
						'type'            => 'editor',
						'priority'        => 22,
						'label'           => esc_html__( 'Text/HTML for Right Content', 'zakra' ),
						'section'         => 'zakra_footer_bottom_bar',
						'active_callback' => array(
							array(
								'setting'  => 'zakra_footer_bar_section_two',
								'operator' => '==',
								'value'    => 'text_html',
							),
						),
					),
				),

				/**
				 * Option: Section Two Content > Menu Content.
				 */
				'zakra_footer_bar_section_two_menu' => array(
					'setting' => array(
						'default'           => 'none',
						'sanitize_callback' => false,
					),
					'control' => array(
						'type'            => 'select',
						'priority'        => 30,
						'is_default_type' => true,
						'label'           => esc_html__( 'Select a Menu for Right Content', 'zakra' ),
						'section'         => 'zakra_footer_bottom_bar',
						'choices'         => $this->get_menu_options(),
						'active_callback' => array(
							array(
								'setting'  => 'zakra_footer_bar_section_two',
								'operator' => '===',
								'value'    => 'menu',
							),
						),
					),
				),

				/*========================================== FOOTER > FOOTER BAR:STYLING ==========================================*/
				/**
				 * Option: Text Color.
				 */
				'zakra_footer_bar_text_color'       => array(
					'output'  => array(
						array(
							'selector' => '.tg-site-footer .tg-site-footer-bar',
							'property' => 'color',
						),
					),
					'setting' => array(
						'default'           => '#51585f',
						'capability'        => 'edit_theme_options',
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_alpha_color' ),
					),
					'control' => array(
						'type'     => 'color',
						'priority' => 40,
						'label'    => esc_html__( 'Text Color', 'zakra' ),
						'section'  => 'zakra_footer_bottom_bar',
						'choices'  => array(
							'alpha' => true,
						),
					),
				),

				/**
				 * Option: Link Color.
				 */
				'zakra_footer_bar_link_color'       => array(
					'output'  => array(
						array(
							'selector' => '.tg-site-footer .tg-site-footer-bar a',
							'property' => 'color',
						),
					),
					'setting' => array(
						'default'           => '#16181a',
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_alpha_color' ),
					),
					'control' => array(
						'type'     => 'color',
						'priority' => 50,
						'label'    => esc_html__( 'Link Color', 'zakra' ),
						'section'  => 'zakra_footer_bottom_bar',
						'choices'  => array(
							'alpha' => true,
						),
					),
				),

				/**
				 * Option: Link Hover Color.
				 */
				'zakra_footer_bar_link_hover_color' => array(
					'output'  => array(
						array(
							'selector' => '.tg-site-footer .tg-site-footer-bar a:hover, .tg-site-footer .tg-site-footer-bar a:focus',
							'property' => 'color',
						),
					),
					'setting' => array(
						'default'           => '#269bd1',
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_alpha_color' ),
					),
					'control' => array(
						'type'     => 'color',
						'priority' => 60,
						'label'    => esc_html__( 'Link Hover Color', 'zakra' ),
						'section'  => 'zakra_footer_bottom_bar',
						'choices'  => array(
							'alpha' => true,
						),
					),
				),

				/**
				 * Option: Border Top.
				 */
				'zakra_footer_bar_border_top_width' => array(
					'output'  => array(
						array(
							'selector' => '.tg-site-footer .tg-site-footer-bar .tg-container',
							'property' => 'border-top-width',
						),
					),
					'setting' => array(
						'default'           => array(
							'slider' => 0,
							'suffix' => 'px',
						),
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_slider' ),
					),
					'control' => array(
						'type'        => 'slider',
						'priority'    => 70,
						'label'       => esc_html__( 'Border Top', 'zakra' ),
						'section'     => 'zakra_footer_bottom_bar',
						'input_attrs' => array(
							'min'  => 0,
							'max'  => 20,
							'step' => 1,
						),
					),
				),

				/**
				 * Option: Border Top Color.
				 */
				'zakra_footer_bar_border_top_color' => array(
					'output'  => array(
						array(
							'selector' => '.tg-site-footer .tg-site-footer-bar .tg-container',
							'property' => 'border-top-color',
						),
					),
					'setting' => array(
						'default'           => '#e9ecef',
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_alpha_color' ),
					),
					'control' => array(
						'type'     => 'color',
						'priority' => 80,
						'label'    => esc_html__( 'Border Top Color', 'zakra' ),
						'section'  => 'zakra_footer_bottom_bar',
						'choices'  => array(
							'alpha' => true,
						),
					),
				),

				/**
				 * Option: Background.
				 */
				'zakra_footer_bar_bg'               => array(
					'output'  => array(
						array(
							'selector' => '.tg-site-footer .tg-site-footer-bar',
						),
					),
					'setting' => array(
						'default'           => array(
							'background-color'      => '#ffffff',
							'background-image'      => '',
							'background-repeat'     => 'repeat',
							'background-position'   => 'center center',
							'background-size'       => 'contain',
							'background-attachment' => 'scroll',
						),
						'sanitize_callback' => array( 'Zakra_Customizer_Sanitize', 'sanitize_background' ),
					),
					'control' => array(
						'type'     => 'background',
						'priority' => 90,
						'label'    => esc_html__( 'Background', 'zakra' ),
						'section'  => 'zakra_footer_bottom_bar',
					),
				),

			);

		}

	}

	new Zakra_Customize_Footer_Bottom_Bar_Option();

endif;
