<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'admin_ant_local' );

/** MySQL database username */
define( 'DB_USER', 'admin_ant_local' );

/** MySQL database password */
define( 'DB_PASSWORD', '96164@Ere#110' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         ')e`bJNia:]^Ne.P&rKfd@1Vk&@oE_EnkUn~??u^F6_-}HkWR]y;gILt+0Z]WH[yl' );
define( 'SECURE_AUTH_KEY',  'JmA&zixZw9$o6tiJ63tr+K;[&gIOW?iQ3/awT]DSKCc_jFEMIBf4K?QacwB/iV9W' );
define( 'LOGGED_IN_KEY',    '!4.KwAfFJVXzg#^PlJlmLrQiyDhmt3KB*Vx59$8)ljTxo,xe>FVOzv&G=~MA4~ ;' );
define( 'NONCE_KEY',        'ao@JR|i[0$(e)3r!ScIOV!h}xO_fN[]/DI[:/z=J&>6-(ccy:r/(yyIQu)N5S}:-' );
define( 'AUTH_SALT',        'SH{v,|VyrE?_q)1|7)A^|UL 25Wt8pgFYzc<=-`QqUd0^WhU4DOeou=#X:A&NkW$' );
define( 'SECURE_AUTH_SALT', 'myQfu ,80],Xj+I@?nv,-s{u.srr`SF+:O@AU%4T!u*b_x.At)8kqjn7S+et|]E)' );
define( 'LOGGED_IN_SALT',   '<HYEkN|f&wmwhO&h?QwCC,3I/axUi[!J7sz~*W!Bqo!m]6afU_IF%M+6BXdm4bxH' );
define( 'NONCE_SALT',       '!RXU}@[GR&n>&L?)B89q$7xJ%n=90.a8UcAKHH!9vWB-oG6}A{)DRX3Jwmzp(_Ji' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );

/**Execution Time Extended**/
set_time_limit(300);
