<?php
/**
 * Class Advanced_Ads_Ad_Network
 */
abstract class Advanced_Ads_Ad_Network{
    /**
     * @var string The identifier will be used for generated ids, names etc.
     */
    protected $identifier;

    /**
     * @var string The name of the ad network
     */
    protected $name;

    /**
     * @var string the name of the hook for the advanced ads settings page
     */
    protected $settings_page_hook;

    /**
     * @var the wordpress nonce (retrieve with the get_nonce method)
     */
    protected $nonce;

    /**
     * Advanced_Ads_Ad_Network constructor.
     * @param $identifier an identifier that will be used for hooks, settings, ids and much more - MAKE SURE IT IS UNIQUE!
     * @param $name - the (translateable) display name for this ad network
     */
    public function __construct($identifier, $name){
        $this->identifier = $identifier;
        $this->name = $name;
        $this->settings_page_hook = ADVADS_SLUG . '-' . $this->identifier . '-settings-page';
        $this->settings_section_id = ADVADS_SLUG . '-' . $this->identifier . '-settings-section';
        $this->settings_init_hook = ADVADS_SLUG . '-' . $this->identifier . '-settings-init';
    }

    /**
     * @return string the identifier for this network
     */
    public function get_identifier() {
        return $this->identifier;
    }

    /**
     * @return string the display name for this network
     */
    public function get_display_name(){
        return $this->name;
    }

    /**
     * @return string the display value for the settings tab
     */
    public function get_settings_tab_name(){
        return $this->get_display_name();
    }

    /**
     * @return string url for the settings page (admin)
     */
    public function get_settings_href(){
        return admin_url( 'admin.php?page=advanced-ads-settings#top#' . $this->identifier );
    }

    /**
     * @return string the identifier / name for the javascript file that will be injected.
     */
    public function get_js_library_name(){
        return "advanced-ads-network" . $this->identifier;
    }

    /**
     * registers this ad network
     */
    public function register(){
        //  register the ad type
        add_filter('advanced-ads-ad-types', array($this, 'register_ad_type_callback'));

        if (is_admin()) {
            if (defined('DOING_AJAX') && DOING_AJAX){
                //  we need add all the actions for our ajax calls here.
                //  our ajax method that will trigger an update of the ad units of this network
                add_action('wp_ajax_advanced_ads_get_ad_units_' . $this->identifier, array($this, 'update_external_ad_units'));
                add_action('wp_ajax_advanced_ads_toggle_idle_ads_' . $this->identifier, array( $this, 'toggle_idle_ads'));
            } else {
                //  find out if we need to register the settings. this is necessary
                //  1) when viewing the settings (admin.php with page="advanced-ads-settings")
                //  2) when posting the settings to options.php
                //  in all other cases, there is nothing to do
                global $pagenow;
                $requires_settings = false;
                $requires_javascript = false;

                if ($pagenow == "admin.php") {
                    $page = isset($_REQUEST['page']) ? $_REQUEST['page'] : null;
                    switch ($page){
                        case "advanced-ads-settings":
                            $requires_settings = true;
                            $requires_javascript = true;
                            break;
                        case "advanced-ads":
                            $requires_javascript = true;
                        default:
                            break;
                    }
                }
                else if ($pagenow == "options.php") {
                    $requires_settings = true;
                }
                else if ($pagenow == 'post.php' || $pagenow == 'post-new.php'){
                	$post_type = isset($_REQUEST['post_type']) ? $_REQUEST['post_type'] : '';
                    add_filter('advanced-ads-ad-settings-pre-save', array($this, 'sanitize_ad_settings'));
                    if (isset($_GET['action']) && 'edit' == $_GET['action']){
                        $requires_javascript = true;
                    }
                    else if ($post_type == "advanced_ads"){
                        $requires_javascript = true;
                    }
                }

                if ($requires_settings) {
                    //  register the settings
                    add_action('advanced-ads-settings-init', array($this, 'register_settings_callback'));
                    add_filter('advanced-ads-setting-tabs', array($this, 'register_settings_tabs_callback'));
                }
                if ($requires_javascript){
                    add_action( 'admin_enqueue_scripts', array($this, 'enqueue_scripts_callback') );
                }
            }
        }
    }

    /**
     * the callback method for the filter "advanced-ads-ad-types"
     * @param $types
     */
    public function register_ad_type_callback($types){
        $types[$this->identifier] = $this->get_ad_type();
        return $types;
    }
    /**
     * this method will be called for the wp action "advanced-ads-settings-init" and therefore has to be public.
     */
    public function register_settings_callback(){
        //  register new settings
        register_setting( ADVADS_SLUG . '-' . $this->identifier,
            ADVADS_SLUG . '-' . $this->identifier,
            array($this, 'sanitize_settings_callback')
        );

        //  add a new section
        add_settings_section(
            $this->settings_section_id,
            '', //__( 'AdSense', 'advanced-ads' ),
            array($this, 'render_settings_callback'),
            $this->settings_page_hook
        );

        //  register all the custom settings
        $this->register_settings($this->settings_page_hook, $this->settings_section_id);

        do_action($this->settings_init_hook, $this->settings_page_hook);
    }

    protected function get_localized_script_object_name(){
        return $this->identifier . 'AdvancedAdsJS';
    }
    public function enqueue_scripts_callback(){
        $js_path = $this->get_javascript_base_path();
        if ($js_path) {
            $id = $this->get_js_library_name();
            wp_enqueue_script($id, $js_path, array('jquery', 'advanced-ads-admin-script'));
            //  next we have to pass the data.
            $data = array(
                'nonce' => $this->get_nonce()
            );
            $data = $this->append_javascript_data($data);
            wp_localize_script($id, $this->get_localized_script_object_name(), $data);
        }
    }

    /**
     * @return string
     */
    public function get_nonce(){
        if (! $this->nonce)
            $this->nonce = wp_create_nonce($this->get_nonce_action());
        return $this->nonce;
    }

    /**
     * returns the action (name) of the nonce for this network
     * in some cases you may want to override this method to faciliate
     * integration with existing code
     * @return string
     */
    public function get_nonce_action(){
        return 'advads-network-' . $this->identifier;
    }

    /**
     * this method will be called for the wp action "advanced-ads-settings-tabs" and therefore has to be public.
     * it simply adds a tab for this ad type. if you don't want that just override this method with an empty one.
     */
    public function register_settings_tabs_callback($tabs){
        $tab_id = $this->identifier;
        $tabs[$tab_id] = array(
            'page' => $this->settings_page_hook,
            'group' => ADVADS_SLUG . '-' . $this->identifier,
            'tabid' => $tab_id,
            'title' => $this->get_settings_tab_name()
        );
        return $tabs;
    }

    public function render_settings_callback(){

    }

    public function sanitize_settings_callback($options){
        $options = $this->sanitize_settings($options);
        return $options;
    }

    public function sanitize_ad_settings_callback( array $ad_settings_post ){
        return $this->sanitize_ad_settings($ad_settings_post);
    }

    /**
     * performs basic security checks for wp ajax requests (nonce, capabilities)
     * dies, when a problem was detected
     */
    protected function ajax_security_checks(){
        if ( ! current_user_can( Advanced_Ads_Plugin::user_cap( 'advanced_ads_manage_options' ) ) ) {
            //TODO: translate
            $this->send_ajax_error_response_and_die("You don't have the permission to manage ads.");
        }
        $nonce = isset( $_REQUEST['nonce'] ) ? $_REQUEST['nonce'] : '';
        if ( ! wp_verify_nonce( $nonce, $this->get_nonce_action() ) ) {
            //TODO: translate
            $this->send_ajax_error_response_and_die("You sent an invalid request.");
        }
    }

    protected function send_ajax_response_and_die($json_serializable_response = false){
        if (!$json_serializable_response) $json_serializable_response = new stdClass();
        header( 'Content-Type: application/json' );
        echo json_encode($json_serializable_response);
        die();
    }

    protected function send_ajax_error_response_and_die($message){
        header( 'Content-Type: application/json' );
        $r = new stdClass();
        $r->error = $message;
        echo json_encode($r);
        die();
    }

    public function toggle_idle_ads(){
        $this->ajax_security_checks();
        global $external_ad_unit_id;
        $hide_idle_ads = isset($_POST['hide']) ? $_POST['hide'] : false;
        $external_ad_unit_id = isset($_POST['ad_unit_id']) ? $_POST['ad_unit_id'] : "";
        if (!$external_ad_unit_id) $external_ad_unit_id = "";
        ob_start();

        $this->print_external_ads_list($hide_idle_ads);
        $ad_selector = ob_get_clean();

        $response = array(
            'status' => true,
            'html'   => $ad_selector,
        );
        $this->send_ajax_response_and_die($response);
    }

    /**
     * when you need some kind of manual ad setup (meaning you can edit the custom inputs of this ad type)
     * you should override this method to return true. this results in an additional link (Setup code manually)
     * @return bool
     */
    public function supports_manual_ad_setup(){
        return false;
    }

    public abstract function print_external_ads_list($hide_idle_ads = true);

    /**
     * retrieves an instance of the ad type for this ad network
     */
    public abstract function get_ad_type();

    /**
     * this method will be called via wp AJAX.
     * it has to retrieve the list of ads from the ad network and store it as an option
     * does not return ad units - use "get_external_ad_units" if you're looking for an array of ad units
     */
    public abstract function update_external_ad_units();

    /**
     * adds the custom wp settings to the tab for this ad unit
     */
    protected abstract function register_settings($hook, $section_id);

    /**
     * sanitize the network specific options
     * @param $options the options to sanitize
     * @return mixed the sanitizzed options
     */
    protected abstract function sanitize_settings($options);

    /**
     * sanitize the settings for this ad network
     * @param $ad_settings_post
     * @return mixed the sanitized settings
     */
    public abstract function sanitize_ad_settings($ad_settings_post);



    /**
     * @return array of ad units (Advanced_Ads_Ad_Network_Ad_Unit)
     */
    public abstract function get_external_ad_units();

    /**
     * checks if the ad_unit is supported by advanced ads.
     * this determines wheter it can be imported or not.
     * @param $ad_unit
     * @return boolean
     */
    public abstract function is_supported($ad_unit);

    /**
     * there is no common way to connect to an external account. you will have to implement it somehow, just
     * like the whole setup process (usually done in the settings tab of this network). this method provides
     * a way to return this account connection
     * @return boolean true, when an account was successfully connected
     */
    public abstract function is_account_connected();

    /**
     * external ad networks rely on the same javascript base code. however you still have to provide
     * a javascript class that inherits from the AdvancedAdsAdNetwork js class
     * this has to point to that file, or return false,
     * if you don't have to include it in another way (NOT RECOMMENDED!)
     * @return string path to the javascript file containing the javascriot class for this ad type
     */
    public abstract function get_javascript_base_path();

    /**
     * our script might need translations or other variables (llike a nonce, which is included automatically)
     * add anything you need in this method and return the array
     * @param $data array holding the data
     * @return array the data, that will be passed to the base javascript file containing the AdvancedAdsAdNetwork class
     */
    public abstract function append_javascript_data(&$data);
}