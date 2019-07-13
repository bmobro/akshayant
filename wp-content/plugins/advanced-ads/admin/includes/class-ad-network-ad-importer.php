<?php
abstract class Advanced_Ads_Ad_Network_Ad_Importer{
    protected $ad_network;

    /**
     * Advanced_Ads_Ad_Network_Ad_Importer constructor.
     * @param $ad_network
     */
    public function __construct($ad_network)
    {
        $this->ad_network = $ad_network;
    }

    public function render(){

    }
}