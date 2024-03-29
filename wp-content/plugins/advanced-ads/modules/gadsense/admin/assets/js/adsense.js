/**
 * actually this method was moved inside the ad network class.
 * however the responsive addon depends on it, so i made it global again.
 * this makes it downward compatible (with an older version of responsive),
 * but you should probably adjust the responsive plugin to make use of
 * the static method (AdvancedAdsNetworkAdsense.gadsenseFormatAdContent)
 *
 * in case you come across a missing method originating from the deleted new-ad.js,
 * please just make the methods static and create a wrapper function like the one below
 */
window.gadsenseFormatAdContent = function() {
    AdvancedAdsNetworkAdsense.gadsenseFormatAdContent();
};

class AdvancedAdsNetworkAdsense extends AdvancedAdsAdNetwork{
    constructor(codes){
        super('adsense');
        this.name = 'adsense';
        this.codes = codes;
        this.parseCodeBtnClicked = false;
        this.preventCloseAdSelector = false;
        // this.adUnitName = null;
        //  the legacy code of gadsense executes a script inside a php template and will may not have been executed
        //  at this stage. the AdvancedAdsAdNetwork class already knows the publisher id, so we will overwrite
        //  the field in gadsenseData to be up to date at all times.
        //  TODO: the use of gadsenseData.pubId could be removed from this class in favor of  this.vars.pubId
        gadsenseData.pubId = this.vars.pubId;
    }
    openSelector(){

    }

    closeAdSelector(){
        if (this.preventCloseAdSelector) return;
        AdvancedAdsAdmin.AdImporter.closeAdSelector();
    }

    getSelectedId() {
        const pubId = gadsenseData.pubId || false;
        const slotId = $( '#unit-code' ).val().trim();
        if (pubId && slotId)
            return "ca-" + pubId + ":" + slotId;
        return null;
    }

    selectAdFromList(slotId){
        this.preventCloseAdSelector = true;
        this.onSelectAd(slotId);
        AdvancedAdsAdmin.AdImporter.openExternalAdsList();

        //  try to update the adsense stats dashboard
        jQuery('#advads-gadsense-box').show();
        jQuery( '.advanced-ads-adsense-dashboard' ).each( function(key,elm) {
            var elmData = jQuery(elm).data('refresh');
            if (elmData){
                elmData = typeof(elmData) === 'string' ? JSON.parse(elmData) : elmData;
                var unit_code = $('input#unit-code').val();
                elmData.filter_value = unit_code;
                elmData.requires_refresh = true;
                jQuery(elm).data('refresh', elmData);
                Advanced_Ads_Adsense_Helper.process_dashboard(elm);
            }
        });
    }

    updateAdFromList(slotId){
        this.getRemoteCode(slotId);
    }

    getRefreshAdsParameters(){
        return {
            nonce: AdsenseMAPI.nonce,
            action: 'advanced_ads_get_ad_units_adsense',
            account: gadsenseData.pubId,
        };
    }

    onManualSetup() {
        $( '.advads-adsense-code' ).css( 'display', 'none' );
        $( '#remote-ad-unsupported-ad-type' ).css( 'display', 'none' );
        this.undoReadOnly();
        // const name = (this.adUnitName) ? "( " + this.adUnitName + " ) " : "";
        // $( '#advanced-ads-adsense-unit-name').text(name);
    }

    /**
     * parse the code of an adsense ad and adjust the GUI
     * call it, when an ad unit was selected.
     * returns the parsed obj or false, when the ad code could not be parsed
     */
    processAdCode(code){
        const parsed = this.parseAdContentFailsafe(code);
        if ( parsed ) {
            this.undoReadOnly();
            this.setDetailsFromAdCode(parsed);
            this.makeReadOnly();
            $('#remote-ad-code-error').css('display', 'none');
            $('#remote-ad-unsupported-ad-type').css('display', 'none');
            this.closeAdSelector();
        } else {
            $( '#remote-ad-code-error' ).css( 'display', 'block' );
        }
        return parsed;
    }

    /**
     * clone of legacy method
     * @param slotID
     */
    onSelectAd( slotID ) {
        if ( 'undefined' != typeof this.codes[ slotID ] ) {
            this.getSavedDetails(slotID );
        } else {
            this.getRemoteCode( slotID );
        }
    }

    /**
     * legacy method
     * @param slotID
     */
    getSavedDetails( slotID ) {
        if ( 'undefined' != typeof this.codes[slotID] ) {
            var code = this.codes[slotID];
            var parsed = this.processAdCode(code);
            if ( false !== parsed ) {
                $( '#remote-ad-unsupported-ad-type' ).css( 'display', 'none' );
                this.closeAdSelector();
                this.preventCloseAdSelector = false;
            }
        }
    }

    /**
     * legacy method
     * @param slotID
     */
    getRemoteCode( slotID ) {

        if ( '' == slotID ) return;
        $( '#mapi-loading-overlay' ).css( 'display', 'block' );
        const that = this;
        $.ajax({
            type: 'post',
            url: ajaxurl,
            data: {
                nonce: AdsenseMAPI.nonce,
                action: 'advads_mapi_get_adCode',
                unit: slotID,
            },
            success: function(response,status,XHR){
                $( '#mapi-loading-overlay' ).css( 'display', 'none' );
                if ( 'undefined' != typeof response.code ) {
                    $( '#remote-ad-code-msg' ).empty();
                    var parsed = that.processAdCode( response.code );
                    if ( false !== parsed ) {
                        that.codes[slotID] = response.code;
                        AdvancedAdsAdmin.AdImporter.unitIsSupported( slotID );
                    }
                    AdvancedAdsAdmin.AdImporter.highlightSelectedRowInExternalAdsList();
                    // // Update quota message if needed
                    // if (  1 == 0 ) {
                    //     $( '#mapi-quota-message' ).text( response.quotaMsg );
                    //     AdsenseMAPI.quota = response.quota;
                    //     if ( 0 == response.quota ) {
                    //         $( '#mapi-get-adcode,#mapi-get-adunits' ).prop( 'disabled', true );
                    //     }
                    // }
                    that.closeAdSelector();

                } else {
                    if ( 'undefined' != typeof response.raw ) {
                        $( '#remote-ad-code-msg' ).html( response.raw );
                    } else if( 'undefined' != typeof response.msg ) {
                        if ( 'undefined' != typeof response.reload ) {
                            AdvancedAdsAdmin.AdImporter.emptyMapiSelector( response.msg );
                        } else {
                            if ( 'doesNotSupportAdUnitType' == response.msg ) {
                                AdvancedAdsAdmin.AdImporter.unitIsNotSupported( slotID );
                            } else {
                                $( '#remote-ad-code-msg' ).html( response.msg );
                            }
                        }
                        if ( 'undefined' != typeof response.raw ) {
                            console.log( response.raw );
                        }
                    }
                }
            },
            error: function(request,status,err){
                $( '#mapi-loading-overlay' ).css( 'display', 'none' );

            },
        });

    }

    /**
     * legacy method
     * Parse ad content.
     *
     * @return {!Object}
     */
    parseAdContent(content) {
        var rawContent = ('undefined' != typeof(content))? content.trim() : '';
        var theAd = {};
        var theContent = $( '<div />' ).html( rawContent );
        var adByGoogle = theContent.find( 'ins' );
        theAd.slotId = adByGoogle.attr( 'data-ad-slot' ) || '';
        if ('undefined' != typeof(adByGoogle.attr( 'data-ad-client' ))) {
            theAd.pubId = adByGoogle.attr( 'data-ad-client' ).substr( 3 );
        }

        if (undefined !== theAd.slotId && '' != theAd.pubId) {
            theAd.display = adByGoogle.css( 'display' );
            theAd.format = adByGoogle.attr( 'data-ad-format' );
            theAd.layout = adByGoogle.attr( 'data-ad-layout' ); // for InFeed and InArticle
            theAd.layout_key = adByGoogle.attr( 'data-ad-layout-key' ); // for InFeed
            theAd.style = adByGoogle.attr( 'style' ) || '';

            /* normal ad */
            if ('undefined' == typeof(theAd.format) && -1 != theAd.style.indexOf( 'width' )) {
                theAd.type = 'normal';
                theAd.width = adByGoogle.css( 'width' ).replace( 'px', '' );
                theAd.height = adByGoogle.css( 'height' ).replace( 'px', '' );
            }

            /* Responsive ad, auto resize */
            else if ('undefined' != typeof(theAd.format) && 'auto' == theAd.format) {
                theAd.type = 'responsive';
            }


            /* older link unit format; for new ads the format type is no longer needed; link units are created through the AdSense panel */
            else if ('undefined' != typeof(theAd.format) && 'link' == theAd.format) {

                if( -1 != theAd.style.indexOf( 'width' ) ){
                    // is fixed size
                    theAd.width = adByGoogle.css( 'width' ).replace( 'px', '' );
                    theAd.height = adByGoogle.css( 'height' ).replace( 'px', '' );
                    theAd.type = 'link';
                } else {
                    // is responsive
                    theAd.type = 'link-responsive';
                }
            }

            /* Responsive Matched Content */
            else if ('undefined' != typeof(theAd.format) && 'autorelaxed' == theAd.format) {
                theAd.type = 'matched-content';
            }

            /* InArticle & InFeed ads */
            else if ('undefined' != typeof(theAd.format) && 'fluid' == theAd.format) {

                // InFeed
                if('undefined' != typeof(theAd.layout) && 'in-article' == theAd.layout){
                    theAd.type = 'in-article';
                } else {
                    // InArticle
                    theAd.type = 'in-feed';
                }
            }
        }

        /**
         *  Synchronous code
         */
        if ( -1 != rawContent.indexOf( 'google_ad_slot' ) ) {
            var _client = rawContent.match( /google_ad_client ?= ?["']([^'"]+)/ );
            var _slot = rawContent.match( /google_ad_slot ?= ?["']([^'"]+)/ );
            var _format = rawContent.match( /google_ad_format ?= ?["']([^'"]+)/ );
            var _width = rawContent.match( /google_ad_width ?= ?([\d]+)/ );
            var _height = rawContent.match( /google_ad_height ?= ?([\d]+)/ );

            theAd = {};

            theAd.pubId = _client[1].substr( 3 );

            if ( null !== _slot ) {
                theAd.slotId = _slot[1];
            }
            if ( null !== _format ) {
                theAd.format = _format[1];
            }
            if ( null !== _width ) {
                theAd.width = parseInt( _width[1] );
            }
            if ( null !== _height ) {
                theAd.height = parseInt( _height[1] );
            }

            if ( 'undefined' == typeof theAd.format ) {
                theAd.type = 'normal';
            }

        }

        if ( '' == theAd.slotId && gadsenseData.pubId && '' != gadsenseData.pubId ) {
            theAd.type = $( '#unit-type' ).val();
        }

        /* Page-Level ad */
        if ( rawContent.indexOf( 'enable_page_level_ads' ) !== -1 ) {
            theAd = { 'parse_message': 'pageLevelAd' };
        }

        else if ( ! theAd.type ) {
            /* Unknown ad */
            theAd = { 'parse_message': 'unknownAd' };
        }

        $( document ).trigger( 'gadsenseParseAdContent', [ theAd, adByGoogle ] );
        return theAd;
    }

    parseAdContentFailsafe(code) {
        if (typeof(code) == 'string'){
            try {
                const json = JSON.parse(code);
                code = json;
            } catch(e){}
        }

        return typeof(code) == 'object'
            ? code
            : this.parseAdContent( code );
    }

    /**
     * Handle result of parsing content.
     * legacy method
     */
    handleParseResult( parseResult ) {
        $( '#pastecode-msg' ).empty();
        switch ( parseResult.parse_message ) {
            case 'pageLevelAd' :
                advads_show_adsense_auto_ads_warning();
                break;
            case 'unknownAd' :
                // Not recognized ad code
                if ( this.parseCodeBtnClicked && 'post-new.php' == gadsenseData.pagenow ) {
                    // do not show if just after switching to AdSense ad type on ad creation
                    $( '#pastecode-msg' ).append( $( '<p />' ).css( 'color', 'red' ).html( gadsenseData.msg.unknownAd ) );
                }
                break;
            default:
                this.setDetailsFromAdCode( parseResult );
                if ( 'undefined' != typeof AdsenseMAPI && 'undefined' != typeof AdsenseMAPI.hasToken && parseResult.pubId == AdsenseMAPI.pubId ) {
                    var content = $( '#advanced-ads-ad-parameters input[name="advanced_ad[content]"]' ).val();
                    this.mapiSaveAdCode( content, parseResult.slotId );
                    this.makeReadOnly();
                }
                $( '.advads-adsense-code' ).hide();
                $( '.advads-adsense-show-code' ).show();
                $( '#mapi-insert-code' ).show();
                var SNT = this.getCustomInputs();
                SNT.css( 'display', 'block' );
        }
    }

    /**
     * legacy method
     * Set ad parameters fields from the result of parsing ad code
     */
    setDetailsFromAdCode(theAd) {
        this.undoReadOnly();
        $( '#unit-code' ).val( theAd.slotId );
        $( '#advads-adsense-pub-id' ).val( theAd.pubId );
        if ('normal' == theAd.type) {
            $( '#unit-type' ).val( 'normal' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( theAd.width );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( theAd.height );
        }
        if ('responsive' == theAd.type) {
            $( '#unit-type' ).val( 'responsive' );
            $( '#ad-resize-type' ).val( 'auto' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( '' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( '' );
        }
        if ('link' == theAd.type) {
            $( '#unit-type' ).val( 'link' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( theAd.width );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( theAd.height );
        }
        if ('link-responsive' == theAd.type) {
            $( '#unit-type' ).val( 'link-responsive' );
            $( '#ad-resize-type' ).val( 'auto' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( '' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( '' );
        }
        if ('matched-content' == theAd.type) {
            $( '#unit-type' ).val( 'matched-content' );
            $( '#ad-resize-type' ).val( 'auto' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( '' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( '' );
        }
        if ('in-article' == theAd.type) {
            $( '#unit-type' ).val( 'in-article' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( '' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( '' );
        }
        if ('in-feed' == theAd.type) {
            $( '#unit-type' ).val( 'in-feed' );
            $( '#ad-layout-key' ).val( theAd.layout_key );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val( '' );
            $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val( '' );
        }
        var storedPubId = gadsenseData.pubId;

        if ( '' !== storedPubId && theAd.pubId != storedPubId && '' != theAd.slotId ) {
            $( '#adsense-ad-param-error' ).text( gadsenseData.msg.pubIdMismatch );
        } else {
            $( '#adsense-ad-param-error' ).empty();
        }
        $( document ).trigger( 'this.setDetailsFromAdCode', [ theAd ] );
        $( '#unit-type' ).trigger( 'change' );
    }

    /**
     * legacy method
     * Format the post content field
     */
    static gadsenseFormatAdContent() {
        var slotId = $( '#ad-parameters-box #unit-code' ).val();
        var unitType = $( '#ad-parameters-box #unit-type' ).val();
        var publisherId = $( '#advads-adsense-pub-id' ).val() ? $( '#advads-adsense-pub-id' ).val() : gadsenseData.pubId;
        var adContent = {
            slotId: slotId,
            unitType: unitType,
            pubId: publisherId,
        };
        if ('responsive' == unitType) {
            var resize = $( '#ad-parameters-box #ad-resize-type' ).val();
            if (0 == resize) { resize = 'auto'; }
            adContent.resize = resize;
        }
        if ('in-feed' == unitType) {
            adContent.layout_key = $( '#ad-parameters-box #ad-layout-key' ).val();
        }
        if ('undefined' != typeof(adContent.resize) && 'auto' != adContent.resize) {
            $( document ).trigger( 'gadsenseFormatAdResponsive', [adContent] );
        }
        $( document ).trigger( 'gadsenseFormatAdContent', [adContent] );

        if ('undefined' != typeof(window.gadsenseAdContent)) {
            adContent = window.gadsenseAdContent;
            delete( window.gadsenseAdContent );
        }
        $( '#advads-ad-content-adsense' ).val( JSON.stringify( adContent, false, 2 ) );

    }

    /**
     * legacy method
     */
    updateAdsenseType(){
        var type = $( '#unit-type' ).val();
        $( '.advads-adsense-layout' ).hide();
        $( '.advads-adsense-layout' ).next('div').hide();
        $( '.advads-adsense-layout-key' ).hide();
        $( '.advads-adsense-layout-key' ).next('div').hide();
        $( '.advads-ad-notice-in-feed-add-on' ).hide();
        if ( 'responsive' == type || 'link-responsive' == type || 'matched-content' == type ) {
            $( '#advanced-ads-ad-parameters-size' ).css( 'display', 'none' );
            $( '#advanced-ads-ad-parameters-size' ).prev('.label').css( 'display', 'none' );
            $( '#advanced-ads-ad-parameters-size' ).next('.hr').css( 'display', 'none' );
            $( '.clearfix-before' ).show();
        } else if ( 'in-feed' == type ) {
            $( '.advads-adsense-layout' ).css( 'display', 'none' );
            $( '.advads-adsense-layout' ).next('div').css( 'display', '`none' );
            $( '.advads-adsense-layout-key' ).css( 'display', 'block' );
            $( '.advads-adsense-layout-key' ).next('div').css( 'display', 'block' );
            $( '.advads-adsense-layout-key' ).next('div').css( 'display', 'block' );
            $( '#advanced-ads-ad-parameters-size' ).css( 'display', 'none' );
            $( '#advanced-ads-ad-parameters-size' ).prev('.label').css( 'display', 'none' );
            $( '#advanced-ads-ad-parameters-size' ).next('.hr').css( 'display', 'none' );
            // show add-on notice
            $( '.advads-ad-notice-in-feed-add-on' ).show();
            $( '.clearfix-before' ).show();
        } else if ( 'in-article' == type ) {
            $( '#advanced-ads-ad-parameters-size' ).css( 'display', 'none' );
            $( '#advanced-ads-ad-parameters-size' ).prev('.label').css( 'display', 'none' );
            $( '#advanced-ads-ad-parameters-size' ).next('.hr').css( 'display', 'none' );
            $( '.clearfix-before' ).show();
        } else if ( 'normal' == type || 'link' == type ) {
            $( '#advanced-ads-ad-parameters-size' ).css( 'display', 'block' );
            $( '#advanced-ads-ad-parameters-size' ).prev('.label').css( 'display', 'block' );
            $( '#advanced-ads-ad-parameters-size' ).next('.hr').css( 'display', 'block' );
            $( '.clearfix-before' ).hide();

            if ( ! $( '[name="advanced_ad\[width\]"]' ).val() ) {
                $( '[name="advanced_ad\[width\]"]' ).val( '300' );
            }
            if ( ! $( '[name="advanced_ad\[height\]"]' ).val() ) {
                $( '[name="advanced_ad\[height\]"]' ).val( '250' );
            }
        }
        $( document ).trigger( 'gadsenseUnitChanged' );
        AdvancedAdsNetworkAdsense.gadsenseFormatAdContent();

        this.show_float_warnings( type );
    }

    /**
     * legacy method
     * Show / hide position warning.
     */
    show_float_warnings( unit_type ) {
        var resize_type = $('#ad-resize-type').val();
        var position = $( '#advanced-ad-output-position input[name="advanced_ad[output][position]"]:checked' ).val();

        if (
            ( -1 !== [ 'link-responsive', 'matched-content', 'in-article', 'in-feed' ].indexOf( unit_type )
                || ( 'responsive' === unit_type && 'manual' !== resize_type )
            )
            && ( 'left' == position || 'right' == position )
        ) {
            $('#ad-parameters-box-notices .advads-ad-notice-responsive-position').show();
        } else {
            $('#ad-parameters-box-notices .advads-ad-notice-responsive-position').hide();
        }
    }

    /**
     * legacy method - adds readonly to relevant inputs
     */
    makeReadOnly() {
        $( '#unit-code,#ad-layout,#ad-layout-key,[name="advanced_ad[width]"],[name="advanced_ad[height]"]' ).prop( 'readonly', true );
        $( '#unit-type option:not(:selected)' ).prop( 'disabled', true );
    }

    /**
     * legacy method - removes readonly from relevant inputs  (original name getSlotAndType_jq)
     */
    undoReadOnly() {
        $( '#unit-code,#ad-layout,#ad-layout-key,[name="advanced_ad[width]"],[name="advanced_ad[height]"]' ).prop( 'readonly', false );
        $( '#unit-type option:not(:selected)' ).prop( 'disabled', false );
    }

    getCustomInputs() {
        var $div1 = $( '#unit-code' ).closest( 'div' );
        var $label1 = $div1.prev();
        var $hr1 = $div1.next();
        var $label2 = $hr1.next();
        var $div2 = $label2.next();

        var $elems = $div1.add( $label1 ).add( $hr1 ).add( $label2 ).add( $div2 );
        return $elems;
    }

    onSelected(){
        //handle a click from the "Switch to AdSense ad" button
        if (AdvancedAdsAdmin.AdImporter.adsenseCode){
            this.parseCodeBtnClicked = true;
            const parseResult = this.parseAdContent(AdvancedAdsAdmin.AdImporter.adsenseCode);
            AdvancedAdsAdmin.AdImporter.adsenseCode = null;
            this.handleParseResult( parseResult );
        }
        else{
            //  when you are not connected to adsense, or if the ad was edited manually open the manual setup view
            let switchToManualSetup = ! this.vars.connected;
            if (! switchToManualSetup) {
                const code = this.codes[this.getSelectedId()];
                const parsedAd = this.parseAdContentFailsafe(code);
                if (parsedAd) {
                    //  check
                    //  we need to check if the type of the ad is different from the default. this marks a manually setup ad.
                    const unitType = $('#unit-type').val();
                    if (parsedAd.type != unitType) {
                        //this ad was manually setup. don't open the selector, but switch to manual select.
                        switchToManualSetup = true;

                    }
                }
            }
            if (switchToManualSetup) {
                AdvancedAdsAdmin.AdImporter.manualSetup();
            }
            else if (AdvancedAdsAdmin.AdImporter.highlightSelectedRowInExternalAdsList() || ! this.getSelectedId()){
                AdvancedAdsAdmin.AdImporter.openExternalAdsList();
            }
        }

    }

    onDomReady() {
        const that = this;
        $( document ).on( 'click', '.advads-adsense-close-code', function( ev ) {
            ev.preventDefault();
            that.onSelected();
        } );

        $( document ).on('click', '.advads-adsense-submit-code', function(ev){
            ev.preventDefault();
            that.parseCodeBtnClicked = true;
            var rawContent = $( '.advads-adsense-content' ).val();
            var parseResult = that.parseAdContent( rawContent );
            that.handleParseResult( parseResult );
            if (AdvancedAdsAdmin.AdImporter.highlightSelectedRowInExternalAdsList()){
                AdvancedAdsAdmin.AdImporter.openExternalAdsList();
                that.preventCloseAdSelector = true;
            }
            else{
                //  no adsense ad with this slot id was found
                //  switches to manual ad setup view
                that.preventCloseAdSelector = false;
                AdvancedAdsAdmin.AdImporter.manualSetup();
            }
        });

        $( document ).on('change', '#unit-type, #unit-code', function (ev) {
            that.checkAdSlotId(this);
        });

        let inputCode = $('#unit-code');
        if (inputCode) {
            this.checkAdSlotId(inputCode[0]);
        }

        $( document ).on( 'change', '#ad-resize-type', function( ev ) {
            that.show_float_warnings( 'responsive' );
        } );
        this.updateAdsenseType();

        if ( 'undefined' != typeof AdsenseMAPI.hasToken ) {
            try {
                this.mapiMayBeSaveAdCode();
            } catch (ex) {}
        }

        this.onSelected();
    }

    checkAdSlotId(elm) {
        if ( 'unit-code' == $( elm ).attr( 'id' ) ) {
            var val = $( elm ).val();
            if (val) val = val.trim();
            if ( val.length > 0 && ( gadsenseData.pubId && -1 != val.indexOf( gadsenseData.pubId.substr( 4 ) ) ) ) {
                // if ( val.length > 0 && -1 != val.indexOf( gadsenseData.pubId.substr( 4 ) ) ) {
                $( '#advads-pubid-in-slot' ).css( 'display', 'block' );
                $( elm ).css( 'background-color', 'rgba(255, 235, 59, 0.33)' );
            } else {
                $( '#unit-code' ).css( 'background-color', '#fff' );
                $( '#advads-pubid-in-slot' ).css( 'display', 'none' );
            }
        } else {
            $( '#unit-code' ).css( 'background-color', '#fff' );
            $( '#advads-pubid-in-slot' ).css( 'display', 'none' );
        }
        this.updateAdsenseType();
    }

    mapiSaveAdCode( code, slot ) {
        if ( 'undefined' != typeof AdsenseMAPI.hasToken && 'undefined' == typeof this.codes[ 'ca-' + AdsenseMAPI.pubId + ':' + slot ] ) {
            this.codes['ca-' + AdsenseMAPI.pubId + ':' + slot] = code;
            $( '#mapi-loading-overlay' ).css( 'display', 'block' );
            $.ajax({
                type: 'post',
                url: ajaxurl,
                data: {
                    nonce: AdsenseMAPI.nonce,
                    slot: slot,
                    code: code,
                    action: 'advads-mapi-reconstructed-code',
                },
                success: function( resp, status, XHR ) {
                    $( '#mapi-loading-overlay' ).css( 'display', 'none' );
                },
                error: function( req, status, err ) {
                    $( '#mapi-loading-overlay' ).css( 'display', 'none' );
                },
            });
        }
    }

    mapiMayBeSaveAdCode(){
        // MAPI not set up
        if ( 'undefined' == typeof AdsenseMAPI.hasToken ) return;
        var slotId = $( '#unit-code' ).val();
        if ( !slotId ) return;

        var type = $( '#unit-type' ).val();
        var width = $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[width]"]' ).val().trim();
        var height = $( '#advanced-ads-ad-parameters-size input[name="advanced_ad[height]"]' ).val().trim();
        var layout = $( '#ad-layout' ).val();
        var layoutKey = $( '#ad-layout-key' ).val();

        var code = false;

        switch ( type ) {
            case 'in-feed':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:block;" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '" ' +
                    'data-ad-layout-key="' + layoutKey + '" ';
                code += 'data-ad-format="fluid"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            case 'in-article':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:block;text-align:center;" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '" ' +
                    'data-ad-layout="in-article" ' +
                    'data-ad-format="fluid"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            case 'matched-content':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:block;" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '" ' +
                    'data-ad-format="autorelaxed"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            case 'link-responsive':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:block;" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '" ' +
                    'data-ad-format="link"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            case 'link':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:block;width:' + width + 'px;height:' + height + 'px" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '" ' +
                    'data-ad-format="link"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            case 'responsive':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:block;" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '" ' +
                    'data-ad-format="auto"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            case 'normal':
                code = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
                    '<ins class="adsbygoogle" ' +
                    'style="display:inline-block;width:' + width + 'px;height:' + height + 'px" ' +
                    'data-ad-client="ca-' + AdsenseMAPI.pubId + '" ' +
                    'data-ad-slot="' + slotId + '"></ins>' +
                    '<script>' +
                    '(adsbygoogle = window.adsbygoogle || []).push({});' +
                    '</script>';
                break;
            default:
        }

        if ( code ) {
            this.mapiSaveAdCode( code, slotId );
        }

    }

}

window.Advanced_Ads_Adsense_Helper = window.Advanced_Ads_Adsense_Helper || {
    build_dropdown: function(selected, values){
        const dropdown = {};
        const container = jQuery('<div class="advads-stats-dd-container"/>');
        const button = jQuery('<div class="advads-stats-dd-button"><span class="dashicons dashicons-admin-multisite"></span></div>');
        container.append(button);
        const fc = jQuery('<div style="right:0; width:300px; position:absolute; display:none;"/>');
        const items = jQuery('<div class="advads-stats-dd-items"/>');
        for (let i in values){
            const val = values[i];
            const itm = jQuery('<div class="advads-stats-dd-item">' + val + '</div>');
            // if (selected === val) itm.addClass("advads-stats-dd-item-selected");
            if (selected === i) itm.addClass("advads-stats-dd-item-selected");
            itm.data('key', i);
            itm.data('val', val);
            itm[0].onclick = function(evt){
                jQuery(fc).fadeOut('fast');
                const key = jQuery(this).data('key');
                if (dropdown.onclick) dropdown.onclick(key);
            }
            items.append(itm);
        }
        container.append(fc);
        fc.append(items);

        button[0].onclick = function(e){
            e.stopPropagation();
            jQuery(fc).fadeToggle('fast');
        };
        jQuery(document).click(function(){
            jQuery(fc).fadeOut('fast');
        });

        dropdown.elm = container;
        return dropdown;
    },


    loading_spinner: function(elm, visible){
        let spinner = jQuery(elm).find("div[spinner='1']");;
        if (spinner && spinner.length){
            spinner = spinner[0];
        }
        else{
            spinner = jQuery('<div spinner="1" style="height:100%; width:100%; position:absolute; left:0; top:0;"><div style="z-index:2; background-color: rgba(200,200,200,0.5); height:100%; vertical-align:middle; text-align:center;"><span class="spinner advads-ad-parameters-spinner advads-spinner"/></div></div>');
            elm.append(spinner);
        }
        if (visible) jQuery(spinner).show();
        else jQuery(spinner).hide();
    },

    build_dashboard: function(summary, elm){
        if (! summary) summary = {};
        const container = jQuery('<div/>');
        Advanced_Ads_Adsense_Helper.loading_spinner(container, true);

        if (summary.dimensions){
            const dimensions = summary.dimensions;
            if (! dimensions['*']) dimensions['*'] = advadstxt.all;
            if (! summary.filter_value) summary.filter_value = "*";
            // const selected = summary.dimension || dimensions['*'];
            const dd = Advanced_Ads_Adsense_Helper.build_dropdown(summary.filter_value, dimensions);
            dd.onclick = function(val){
                Advanced_Ads_Adsense_Helper.request_dashboard(elm, {dimension_name: summary.dimension_name, filter: val});
            };
            container.append(dd.elm);
        }
        if (summary.age){
            container.append(jQuery('<div style="clear: right; float:right; text-align:right; color:#bbbbbb; margin-top:5px;">' + summary.age + '</div>'));
        }

        //  when there is no filter value, this usually means that there is no data for this ad
        //  i used to display a general error message (advadstxt.no_results), but this looks too much like an error
        //  and that's why we will ignore it for now and simply display a bunch of zeroes
        // if (summary.filterValueExists != undefined && ! summary.filterValueExists){
        // 	summary.valid = false;
        // 	summary.errors = summary.errors || [];
        // 	summary.errors.push(advadstxt.no_results);
        // }

        const dflex = jQuery('<div class="advads-flex"/>')
        container.append(dflex);

        if (summary.errors) {
            const derrors = jQuery('<ul class="advads-error-message"/>')
            container.append(derrors);
            for (let i in summary.errors) {
                const msg = advadstxt.error_message.replace('\%1$s', summary.errors[i]);
                derrors.append(jQuery('<li>' + msg + '</li>'));
            }
        }
        else {
            if (!summary.valid || !summary.earningsToday) {
                //  we might have some old data floating around...
                if (Advanced_Ads_Adsense_Helper.lastSummary) {
                    summary = Advanced_Ads_Adsense_Helper.lastSummary;
                } else {
                    summary.earningsToday = summary.earningsYesterday = summary.earnings7Days = summary.earningsThisMonth = summary.earnings28Days = '...';
                }
            } else if (summary.valid) {
                //  remember the summary to be able to quickly fall back in case of a future error
                Advanced_Ads_Adsense_Helper.lastSummary = summary;
            }
            dflex.append(Advanced_Ads_Adsense_Helper.build_dashboard_item(advadstxt.today, summary.earningsToday));
            dflex.append(Advanced_Ads_Adsense_Helper.build_dashboard_item(advadstxt.yesterday, summary.earningsYesterday));
            dflex.append(Advanced_Ads_Adsense_Helper.build_dashboard_item(advadstxt.last_n_days.replace('\%1$d', 7), summary.earnings7Days));
            dflex.append(Advanced_Ads_Adsense_Helper.build_dashboard_item(advadstxt.this_month, summary.earningsThisMonth));
            dflex.append(Advanced_Ads_Adsense_Helper.build_dashboard_item(advadstxt.last_n_days.replace('\%1$d', 28), summary.earnings28Days));
        }
        return container;
    },

    build_dashboard_item: function(title, main){
        const d = jQuery('<div class="advads-flex1 advads-stats-box"/>');
        d.append(jQuery('<div>' + title + '</div>'));
        d.append(jQuery('<div class="advads-stats-box-main">' + main + '</div>'));
        return d;
    },

    process_dashboard: function(elm){
        let elmData = jQuery(elm).data('refresh');
        if (elmData){
            try {
                elmData = typeof (elmData) === 'string' ? JSON.parse(elmData) : elmData;
            }
            catch (e){
                elmData = null;
            }
        }
        if (elmData) {
            Advanced_Ads_Adsense_Helper.render_dashboard(elm, elmData);
        }
        const requires_refresh = !elmData || elmData.requires_refresh;
        if (requires_refresh){
            const extraData = {};
            if (elmData){
                if (elmData.dimension_name) extraData.dimension_name = elmData.dimension_name;
                if (elmData.filter_value) extraData.filter = elmData.filter_value;
            }
            Advanced_Ads_Adsense_Helper.request_dashboard(elm, extraData);
        }
    },

    render_dashboard: function(elm, summary){
        jQuery(elm).html('').append(Advanced_Ads_Adsense_Helper.build_dashboard(summary, elm));
        Advanced_Ads_Adsense_Helper.loading_spinner(elm, false);
        const metabox_selector = jQuery(elm).data('metabox_selector');
        if (metabox_selector) {
            if (summary.hidden) {
                jQuery(metabox_selector).hide();
            } else {
                jQuery(metabox_selector).show();
            }
        }
    },

    request_dashboard: function(elm, extraData){
        const data = {
            nonce: Advanced_Ads_Adsense_Helper.nonce,
            action: 'advads_gadsense_dashboard',
            account: gadsenseData.pubId
        };
        if (extraData) for (let i in extraData) data[i] = extraData[i];
        Advanced_Ads_Adsense_Helper.loading_spinner(elm, true);
        Advanced_Ads_Adsense_Helper.process_request(data, function(response){
            Advanced_Ads_Adsense_Helper.render_dashboard(elm, response.summary);
            jQuery(elm).data('refresh', response.summary);
        });
    },

    process_request: function(data, success){
        jQuery.ajax({
            type: 'post',
            url: ajaxurl,
            data: data,
            success: function(response,status,XHR){
                if (response.errors && response.errors.length > 0){
                    let txt = "";
                    for (let i in response.errors) txt += response.errors[i] + "\n";
                    console.log("Error while processing AdSense stats: " + txt);
                }
                success(response,status,XHR);
            },
            error: function(request,status,err){
            },
        });
    },

};