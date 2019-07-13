<?php

/**
 * Class Advanced_Ads_Ad_Network_Ad_Unit
 * This represents an external ad unit. Will be used for importing external ads from various ad networks.
 */
class Advanced_Ads_Ad_Network_Ad_Unit{
    /**
     * @var contains the raw data (typically from a JSON response) for this ad unit
     */
    public $raw;

    /**
     * @var the (external) id of this ad unit (e.g. pub-ca... for adsense)
     */

    public $id;
    /**
     * @var the display name of the ad
     */
    public $name;

    /**
     * @var the type of this ad unit (displayed in list)
     */
    public $display_type;

    /**
     * @var the size of this ad unit (displayed in list)
     */
    public $display_size;

    /**
     * @var in case of an adsense ad, this is the id of the ad without the publisher id
     * the value will be displayed in the ads list
     */
    public $slot_id;

    /**
     * @var a bool that indicates wheter an ad is active (inactives will be hidden by default)
     */
    public $active;

    public function __construct($raw) {
        $this->raw = $raw;
    }

    public static function sort_ad_units(array &$ad_units, $selected_id){
        usort($ad_units, function($a, $b) use ($selected_id){
            if ($a->id == $selected_id) return -1;
            if ($b->id == $selected_id) return 1;
            if ($a->is_supported){
                if (!$b->is_supported) return -1;
            }
            else if ($b->is_supported) return 1;
            return strcmp($a->name, $b->name);
        });

        return $ad_units;
    }
}