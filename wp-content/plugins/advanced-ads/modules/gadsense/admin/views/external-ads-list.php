<?php
global $external_ad_unit_id, $use_dashicons, $closeable, $display_slot_id;

if (! isset($hide_idle_ads)) $hide_idle_ads = true;
if (! isset($ad_units)) $ad_units = array();

?>
<div id="mapi-wrap" class="aa-select-list">
    <?php if ($closeable): ?>
        <button type="button" id="mapi-close-selector" class="notice-dismiss"></button>
    <?php endif;?>
    <i id="mapi-toggle-idle" title="<?php esc_attr_e( 'Show inactive ads' , 'advanced-ads' ); ?>" class="dashicons dashicons-visibility mapiaction" data-mapiaction="toggleidle"></i>
    <?php if ( !empty( $ad_units ) ) : ?>
        <i class="aa-select-list-update dashicons dashicons-update mapiaction" data-mapiaction="updateList" style="color:#0085ba;cursor:pointer;font-size:20px;" title="<?php
        esc_attr_e( 'Update the ad units list', 'advanced-ads' ) ?>"></i>
    <?php endif; ?>
    <div id="mapi-loading-overlay" class="aa-select-list-loading-overlay">
        <img alt="..." src="<?php echo ADVADS_BASE_URL . 'admin/assets/img/loader.gif'; ?>" style="margin-top:8em;" />
    </div>
    <?php if ( !empty( $ad_units ) ) :
        //  this div is referenced in the legacy mapi code. not sure if it is needed at all, it doesn't make much sense right now...
        //  the texts of the span elements were shifted to the right and did not really match well with the ads list (table)
        //  it was removed in favor of the table header below, that was used for empty ad units display only
        //  TODO: make sure the div is not needed anymore, and what it's purpose is, then remove it, if possible
        ?>
        <div id="mapi-list-header" class="aa-select-list-header" style="display:none;">
            <?php if ($use_dashicons) :?>
                <span><?php echo esc_attr_x( 'Ad unit', 'AdSense ad', 'advanced-ads' ); ?></span>
            <?php endif; ?>
            <span><?php esc_html_e( 'Name', 'advanced-ads' ); ?></span>
            <?php if ($display_slot_id):?><span><?php echo esc_html_x( 'Slot ID', 'AdSense ad', 'advanced-ads' ); ?></span><?php endif;?>
            <span><?php echo esc_html_x( 'Type', 'AdSense ad', 'advanced-ads' ); ?></span>
            <span><?php esc_html_e( 'Size', 'advanced-ads' ); ?></span>
        </div>
    <?php endif; ?>
    <div id="mapi-table-wrap" class="aa-select-list-table-wrap">
        <table class="widefat striped">
            <thead>
            <tr>
                <?php if ($use_dashicons) :?>
                    <th><?php echo esc_attr_x( 'Ad unit', 'AdSense ad', 'advanced-ads' ); ?></th>
                <?php endif; ?>
                <th><?php esc_html_e( 'Name', 'advanced-ads' ); ?></th>
                <?php if ($display_slot_id):?><th><?php echo esc_html_x( 'Slot ID', 'AdSense ad', 'advanced-ads' ); ?></th><?php endif;?>
                <th><?php echo esc_html_x( 'Type', 'AdSense ad', 'advanced-ads' ); ?></th>
                <th><?php esc_html_e( 'Size', 'advanced-ads' ); ?></th>
            </tr>
            </thead>
            <tbody>
            <?php if ( empty( $ad_units ) ) : ?>
            <tr>
                <td colspan="5" style="text-align:center;">
                    <?php esc_attr_e( 'No ad units found', 'advanced-ads' ) ?>
                    <i class="dashicons dashicons-update mapiaction" data-mapiaction="updateList" style="color:#0085ba;cursor:pointer;font-size:20px;" title="<?php esc_attr_e( 'Update the ad units list', 'advanced-ads' ) ?>"></i>
                </td>
            </tr>
            <?php else :
                foreach ($ad_units as $ad_unit){
                    $ad_unit->is_supported = $network->is_supported($ad_unit);
                }
                $sorted_adunits = Advanced_Ads_Ad_Network_Ad_Unit::sort_ad_units( $ad_units, $external_ad_unit_id);
            ?>
            <?php foreach ( $sorted_adunits as $unit ) :
                $unit_is_supported = $unit->is_supported;//$network->is_supported($unit);
                $unsupported_class = $unit_is_supported ? '' : ' disabled'; ?>
                <?php if ($use_dashicons):?>
                    <tr data-slotid="<?php echo esc_attr( $unit->id ); ?>" data-active="<?php echo esc_attr( $unit->active ); ?>">
                        <td>
                            <i data-slotid="<?php echo esc_attr( $unit->id ); ?>" class="dashicons dashicons-download mapiaction<?php echo $unsupported_class; ?>" data-mapiaction="getCode" title="<?php esc_attr_e( 'Get the code for this ad', 'advanced-ads' ) ?>"></i>
                            <i data-slotid="<?php echo esc_attr( $unit->id ); ?>" class="dashicons dashicons-update mapiaction" data-mapiaction="updateCode" title="<?php esc_attr_e( 'Update and get the code for this ad from Google', 'advanced-ads' ) ?>"></i>
                        </td>
                <?php else: ?>
                    <tr class="advads-clickable-row mapiaction" data-mapiaction="getCode" data-slotid="<?php echo esc_attr( $unit->id ); ?>" data-active="<?php echo esc_attr( $unit->active ); ?>">
                <?php endif;?>
                    <td><?php echo $unit->name; ?></td>
                    <?php if ($display_slot_id):?>
                    <td class="unitcode"><?php
                        if ( !$unit_is_supported ) {
                            echo '<span class="unsupported"><span>' . esc_html( $unit->slot_id ) . '</span></span>';
                        } else {
                            echo '<span><span>' . esc_html( $unit->slot_id ) . '</span></span>';
                        }
                        ?></td>
                    <?php endif;?>
                    <td class="unittype"><?php
                        if ( !$unit_is_supported ) {
                            echo '<a href="' . esc_url( $unsupported_ad_type_link ) . '" target="_blank" data-type="' . esc_attr( Advanced_Ads_AdSense_MAPI::format_ad_data( $unit->display_type, 'type' ) ) . '">';
                            esc_html_e( 'unsupported', 'advanced-ads' );
                            echo '</a>';
                        } else {
                            echo Advanced_Ads_AdSense_MAPI::format_ad_data( $unit->display_type, 'type' );
                        }
                        ?></td>
                    <td class="unitsize"><?php
                        if ( !$unit_is_supported ) {
                            echo '<a href="' . esc_url( $unsupported_ad_type_link ) . '" target="_blank" data-size="' . Advanced_Ads_AdSense_MAPI::format_ad_data( $unit->display_size, 'size' ) . '">';
                            esc_html_e( 'unsupported', 'advanced-ads' );
                            echo '</a>';
                        } else {
                            echo Advanced_Ads_AdSense_MAPI::format_ad_data( $unit->display_size, 'size' );
                        }
                        ?></td>
                </tr>
            <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>

    <p class="advads-error-message" id="remote-ad-code-error" style="display:none;"><strong><?php esc_attr_e( 'Unrecognized ad code', 'advanced-ads' ); ?></strong></p>
    <p class="advads-error-message" id="remote-ad-code-msg"></p>
    <div style="display:none;" id="remote-ad-unsupported-ad-type"><p><i class="dashicons dashicons-warning"></i><b class="advads-error-message"><?php
                esc_attr_e( 'This ad type can currently not be imported from AdSense.', 'advanced-ads' ) ?></b>&nbsp;<a href="<?php echo ADVADS_URL . 'adsense-ad-type-not-available/#utm_source=advanced-ads&utm_medium=link&utm_campaign=adsense-type-not-available'; ?>" target="_blank"><?php
                esc_attr_e( 'Learn more and help us to enable it here.', 'advanced-ads' ) ?></a></p>
        <?php esc_attr_e( 'In the meantime, you can use AdSense with one of these methods:', 'advanced-ads' ) ?>
        <ul>
            <li><?php _e( 'Click on <em>Insert new AdSense code</em> and copy the code from your AdSense account into it.', 'advanced-ads' ) ?></li>
            <li><?php _e( 'Create an ad on the fly. Just select the <em>Normal</em> or <em>Responsive</em> type and the size.', 'advanced-ads' ) ?></li>
            <li><?php _e( 'Choose a <em>Normal</em>, <em>Responsive</em> or <em>Link Unit</em> ad from your AdSense account.', 'advanced-ads' ) ?></li>
        </ul>
    </div>
</div>