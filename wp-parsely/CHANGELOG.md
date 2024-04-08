# Changelog for the Parsely WordPress plugin

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.14.3](https://github.com/Parsely/wp-parsely/compare/3.14.2...3.14.3) - 2024-04-03

### Added

- PCH Smart Linking: Show "No Block Selected" hint when needed ([#2324](https://github.com/Parsely/wp-parsely/pull/2324))

### Changed

- PCH: Update Settings API structure ([#2351](https://github.com/Parsely/wp-parsely/pull/2351))
- PCH Smart Linking: Update link setting labels for accuracy ([#2349](https://github.com/Parsely/wp-parsely/pull/2349))

### Fixed

- PCH Smart Linking: Escape API response fields ([#2348](https://github.com/Parsely/wp-parsely/pull/2348))
- Fix isSmall deprecation ([#2326](https://github.com/Parsely/wp-parsely/pull/2326))
- PCH Smart Linking: Prevent self-linking ([#2325](https://github.com/Parsely/wp-parsely/pull/2325))
- PCH: Fix some untranslatable strings ([#2323](https://github.com/Parsely/wp-parsely/pull/2323))
- PCH Smart Linking: Fix issues with undo functionality and link offsets ([#2315](https://github.com/Parsely/wp-parsely/pull/2315))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.14.3+label%3A%22Component%3A+Dependencies%22).

## [3.14.2](https://github.com/Parsely/wp-parsely/compare/3.14.1...3.14.2) - 2024-03-19

### Changed

- PCH Related Posts: Don't show "Filter By" when not needed ([#2299](https://github.com/Parsely/wp-parsely/pull/2299))

### Fixed

- PCH: Resolve cursor jump to start in Paragraph Blocks upon selection ([#2305](https://github.com/Parsely/wp-parsely/pull/2305))
- PCH: Fix issue with common styles not being correctly bundled ([#2302](https://github.com/Parsely/wp-parsely/pull/2302))
- PCH Excerpt Generator: Fix missing styling ([#2300](https://github.com/Parsely/wp-parsely/pull/2300))
- PCH Editor Sidebar: Fix incorrect AI opt-in message ([#2296](https://github.com/Parsely/wp-parsely/pull/2296))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.14.2+label%3A%22Component%3A+Dependencies%22).

## [3.14.1](https://github.com/Parsely/wp-parsely/compare/3.14.0...3.14.1) - 2024-03-14

### Changed

- PCH Related Posts: Move action icons to the left ([#2291](https://github.com/Parsely/wp-parsely/pull/2291))
- PCH Related Posts: Check for links in the content by looking for hyperlinks instead ([#2290](https://github.com/Parsely/wp-parsely/pull/2290))
- PCH Smart Linking: Remove Beta Badge ([#2289](https://github.com/Parsely/wp-parsely/pull/2289))
- Content Suggestions API: Truncate very large strings on the body params ([#2286](https://github.com/Parsely/wp-parsely/pull/2286))

### Fixed

- PCH Editor Sidebar: Fix some UI glitches ([#2288](https://github.com/Parsely/wp-parsely/pull/2288))
- PCH Related Posts: Use HTTPS URLs when the site is using HTTPS ([#2287](https://github.com/Parsely/wp-parsely/pull/2287))
- PCH Smart Linking: Fix issues applying Smart Links ([#2285](https://github.com/Parsely/wp-parsely/pull/2285))

## [3.14.0](https://github.com/Parsely/wp-parsely/compare/3.13.3...3.14.0) - 2024-03-12

### Added

- Add option for full metadata in non-posts ([#2250](https://github.com/Parsely/wp-parsely/pull/2250))
- PCH: Add Smart Linking feature ([#2116](https://github.com/Parsely/wp-parsely/pull/2116))

### Changed

- PCH: Redesign the PCH Editor Sidebar ([#2238](https://github.com/Parsely/wp-parsely/pull/2238))
- PCH: Update Content Suggestions API URL to the new version ([#2223](https://github.com/Parsely/wp-parsely/pull/2223))
- Refactor endpoints availability code ([#2198](https://github.com/Parsely/wp-parsely/pull/2198))
- PCH Settings: Refactor the client-side Settings API ([#2193](https://github.com/Parsely/wp-parsely/pull/2193))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.14.0+label%3A%22Component%3A+Dependencies%22).

## [3.13.3](https://github.com/Parsely/wp-parsely/compare/3.13.2...3.13.3) - 2024-02-01

### Fixed

- PCH Excerpt Generator: Fix wrong initialization of the module ([#2179](https://github.com/Parsely/wp-parsely/pull/2179))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.13.3+label%3A%22Component%3A+Dependencies%22).

## [3.13.2](https://github.com/Parsely/wp-parsely/compare/3.13.1...3.13.2) - 2024-01-29

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.13.2+label%3A%22Component%3A+Dependencies%22).

## [3.13.1](https://github.com/Parsely/wp-parsely/compare/3.13.0...3.13.1) - 2024-01-23

### Fixed

- PCH Excerpt Generator: Fix persistent notification ([#2147](https://github.com/Parsely/wp-parsely/pull/2147))
- PCH: Fix blank Dashboard Widget on older WordPress versions ([#2142](https://github.com/Parsely/wp-parsely/pull/2142))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.13.1+label%3A%22Component%3A+Dependencies%22).

## [3.13.0](https://github.com/Parsely/wp-parsely/compare/3.12.0...3.13.0) - 2024-01-22

### Added

- Content Helper Editor Sidebar: Remember settings ([#2106](https://github.com/Parsely/wp-parsely/pull/2106))
- Content Helper Dashboard Widget: Remember settings ([#2091](https://github.com/Parsely/wp-parsely/pull/2091))
- PCH Title Suggestions: Add tone and persona options ([#2086](https://github.com/Parsely/wp-parsely/pull/2086))
- Content Helper: Add Excerpt Generator feature ([#2062](https://github.com/Parsely/wp-parsely/pull/2062))

### Changed

- Settings Page: Improve "Disable JavaScript" help text ([#2094](https://github.com/Parsely/wp-parsely/pull/2094))

### Fixed

- Fix singular translation issues & accessibility improvements  ([#2119](https://github.com/Parsely/wp-parsely/pull/2119))
- Allow remote requests to Parse.ly in controlled environments ([#2111](https://github.com/Parsely/wp-parsely/pull/2111))
- Fix untranslatable string ([#2108](https://github.com/Parsely/wp-parsely/pull/2108))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.13.0+label%3A%22Component%3A+Dependencies%22).

## [3.12.0](https://github.com/Parsely/wp-parsely/compare/3.11.1...3.12.0) - 2023-12-05

### Added

- Add Content Helper events to wp-admin telemetry ([#2020](https://github.com/Parsely/wp-parsely/pull/2020))
- Content Helper Sidebar: Add Title Suggestions feature ([#1967](https://github.com/Parsely/wp-parsely/pull/1967))
- Add wp-admin telemetry (optional and off by default) ([#1758](https://github.com/Parsely/wp-parsely/pull/1758))

### Changed

- Site Health Info: Remove unneeded options ([#2031](https://github.com/Parsely/wp-parsely/pull/2031))

### Fixed

- Initialize Parse.ly options with default values ([#2052](https://github.com/Parsely/wp-parsely/pull/2052))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.12.0+label%3A%22Component%3A+Dependencies%22).

## [3.11.1](https://github.com/Parsely/wp-parsely/compare/3.11.0...3.11.1) - 2023-11-13

### Fixed

- Initialize Parse.ly option before registering the setting ([#2001](https://github.com/Parsely/wp-parsely/pull/2001))


## [3.11.0](https://github.com/Parsely/wp-parsely/compare/3.10.0...3.11.0) - 2023-11-13

### Added

- Metadata: Add filter for custom taxonomies ([#1995](https://github.com/Parsely/wp-parsely/pull/1995))
- PCH Related Top Posts: Add filter values drop-down ([#1986](https://github.com/Parsely/wp-parsely/pull/1986))
- Dashboard Widget: Change number of visible top posts to 5 and add pagination ([#1929](https://github.com/Parsely/wp-parsely/pull/1929))
- Content Helper: Add more period filters ([#1922](https://github.com/Parsely/wp-parsely/pull/1922))
- PCH Related Top Posts: Add filter type drop-down ([#1916](https://github.com/Parsely/wp-parsely/pull/1916))
- Content Helper Sidebar: Add period and metric settings ([#1898](https://github.com/Parsely/wp-parsely/pull/1898))
- Validate API credentials using the Parse.ly API validation endpoint ([#1897](https://github.com/Parsely/wp-parsely/pull/1897))

### Changed

- Update required WordPress version to 5.2 ([#1994](https://github.com/Parsely/wp-parsely/pull/1994))
- Implement a base endpoint class ([#1976](https://github.com/Parsely/wp-parsely/pull/1976))
- PCH Related Top Posts: Use screen-reader-text instead of title ([#1933](https://github.com/Parsely/wp-parsely/pull/1933))

### Removed

- Remove "boost" field from Recommendations Block and Widget ([#1894](https://github.com/Parsely/wp-parsely/pull/1894))

### Fixed

- PCH Dashboard Widget: Fix vanishing filters after error ([#1925](https://github.com/Parsely/wp-parsely/pull/1925))
- PCH Performance Details: Fix freeze after error ([#1924](https://github.com/Parsely/wp-parsely/pull/1924))
- Add 9 missing supported Post Types ([#1915](https://github.com/Parsely/wp-parsely/pull/1915))
- Dashboard Widget: Fix periods letter casing ([#1901](https://github.com/Parsely/wp-parsely/pull/1901))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.11.0+label%3A%22Component%3A+Dependencies%22).

## [3.10.0](https://github.com/Parsely/wp-parsely/compare/3.9.0...3.10.0) - 2023-09-25

### Added

- Dashboard Widget: Add period and metric filters ([#1876](https://github.com/Parsely/wp-parsely/pull/1876))

### Changed

- Update Site ID column in Network Admin List to show — instead of text ([#1859](https://github.com/Parsely/wp-parsely/pull/1859))
- Update WPCS and VIPCS to version 3 ([#1852](https://github.com/Parsely/wp-parsely/pull/1852))
- Upgrade to React 18 and fix depedency issues ([#1847](https://github.com/Parsely/wp-parsely/pull/1847))

### Fixed

- Remove Intl dependency from utils.php ([#1860](https://github.com/Parsely/wp-parsely/pull/1860))
- PCH Top Related Posts: Respect tag case sensitivity ([#1858](https://github.com/Parsely/wp-parsely/pull/1858))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.10.0+label%3A%22Component%3A+Dependencies%22).

## [3.9.0](https://github.com/Parsely/wp-parsely/compare/3.8.4...3.9.0) - 2023-09-04

### Added

- Content Helper: Show hint when HTTP errors are encountered ([#1805](https://github.com/Parsely/wp-parsely/pull/1805))
- Add Validator class ([#1727](https://github.com/Parsely/wp-parsely/pull/1727))
- Add managed options feature ([#1724](https://github.com/Parsely/wp-parsely/pull/1724))
- Implement Custom Post Types tracking by default ([#1677](https://github.com/Parsely/wp-parsely/pull/1677))
- Add filters for disabling Content Helper features ([#1539](https://github.com/Parsely/wp-parsely/pull/1539))

### Changed

- Analytics_Posts_API: Increase request timeout ([#1789](https://github.com/Parsely/wp-parsely/pull/1789))
- Rename init_content_helper() to init_content_helper_editor_sidebar() ([#1744](https://github.com/Parsely/wp-parsely/pull/1744))
- Improve itm_source handling ([#1625](https://github.com/Parsely/wp-parsely/pull/1625))
- PCH Dashboard Widget: Prefer post thumbnails over Parse.ly thumbnails ([#1620](https://github.com/Parsely/wp-parsely/pull/1620))
- Content Helper: Improve error handling ([#1588](https://github.com/Parsely/wp-parsely/pull/1588))
- Improve settings page ([#1574](https://github.com/Parsely/wp-parsely/pull/1574))
- Content Helper: Limit unnecessary requests to the Parse.ly API ([#1541](https://github.com/Parsely/wp-parsely/pull/1541))

### Removed

- Remove Facebook Instant Articles integration ([#1666](https://github.com/Parsely/wp-parsely/pull/1666))

### Fixed

- Content Helper: Fix critical error due to direct views being null ([#1797](https://github.com/Parsely/wp-parsely/pull/1797))
- Prevent always saving settings on Parsely->run() ([#1784](https://github.com/Parsely/wp-parsely/pull/1784))
- Recommendations Block: Fix endless rendering loop ([#1631](https://github.com/Parsely/wp-parsely/pull/1631))
- Recommendations Block: Fix "Children with same Name" error in WordPress Editor ([#1626](https://github.com/Parsely/wp-parsely/pull/1626))
- Update Help / Docs Links ([#1551](https://github.com/Parsely/wp-parsely/pull/1551))
- Settings page: Use a more specific selector to ensure the proper form is selected ([#1543](https://github.com/Parsely/wp-parsely/pull/1543))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.9.0+label%3A%22Component%3A+Dependencies%22).

## [3.8.4](https://github.com/Parsely/wp-parsely/compare/3.8.3...3.8.4) - 2023-03-16

### Fixed

- Fix "Attempt to read property name on null" warning ([#1494](https://github.com/Parsely/wp-parsely/pull/1494))
- Fix Admin Bar "Undefined Property" warning ([#1493](https://github.com/Parsely/wp-parsely/pull/1493))
- Fix NumberFormatter constructor failures ([#1492](https://github.com/Parsely/wp-parsely/pull/1492))
- PCH Stats Column: Fix avg time display issues ([#1491](https://github.com/Parsely/wp-parsely/pull/1491))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.8.4+label%3A%22Component%3A+Dependencies%22).

## [3.8.3](https://github.com/Parsely/wp-parsely/compare/3.8.2...3.8.3) - 2023-03-14

### Fixed

- Fix Content Helper breakages due to null pub_date in API ([#1484](https://github.com/Parsely/wp-parsely/pull/1484))
- Fix fatal errors in Co-Authors plugin integration ([#1482](https://github.com/Parsely/wp-parsely/pull/1482))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.8.3+label%3A%22Component%3A+Dependencies%22).

## [3.8.2](https://github.com/Parsely/wp-parsely/compare/3.8.1...3.8.2) - 2023-03-08

### Fixed

- Fix some fatal errors and warnings ([#1477](https://github.com/Parsely/wp-parsely/pull/1477))
- Fix @wordpress/eslint-plugin v14 warnings ([#1455](https://github.com/Parsely/wp-parsely/pull/1455))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.8.2+label%3A%22Component%3A+Dependencies%22).

## [3.8.1](https://github.com/Parsely/wp-parsely/compare/3.8.0...3.8.1) - 2023-03-06

### Fixed

- Content Helper: Fix period range issue on Performance Details panel ([#1467](https://github.com/Parsely/wp-parsely/pull/1467))

## [3.8.0](https://github.com/Parsely/wp-parsely/compare/3.7.1...3.8.0) - 2023-03-06

### Changed

- Content Helper: Update Related Top Posts range to 7 days ([#1454](https://github.com/Parsely/wp-parsely/pull/1454))
- Content Helper: Add days info in header of Parse.ly Stats column ([#1451](https://github.com/Parsely/wp-parsely/pull/1451))
- Update the "Track Logged-in Users" option to off by default ([#1436](https://github.com/Parsely/wp-parsely/pull/1436))
- Make additional PHP 7.2 adjustments ([#1431](https://github.com/Parsely/wp-parsely/pull/1431))
- Settings page: Update secret field types from text to password ([#1418](https://github.com/Parsely/wp-parsely/pull/1418))
- Upgrade minimum PHP version to 7.2 ([#1401](https://github.com/Parsely/wp-parsely/pull/1401))
- Settings page: Replace screen options with tabs ([#1339](https://github.com/Parsely/wp-parsely/pull/1339))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.8.0+label%3A%22Component%3A+Dependencies%22).

## [3.7.2](https://github.com/Parsely/wp-parsely/compare/3.7.1...3.7.2) - 2023-03-08

### Fixed

- Import fatal and warning fixes from wp-parsely 3.8.2 ([#1477](https://github.com/Parsely/wp-parsely/pull/1477))

## [3.7.1](https://github.com/Parsely/wp-parsely/compare/3.7.0...3.7.1) - 2023-02-27

### Fixed

- Fix Recommended Widget fatal error ([#1424](https://github.com/Parsely/wp-parsely/pull/1424))
- Hide Parse.ly Stats column if API Secret is not available ([#1423](https://github.com/Parsely/wp-parsely/pull/1423))

## [3.7.0](https://github.com/Parsely/wp-parsely/compare/3.6.2...3.7.0) - 2023-02-27

### Added

- Add filters to configure user capability on remote APIs ([#1417](https://github.com/Parsely/wp-parsely/pull/1417))
- Content Helper: Add edit post icon and make linking behavior consistent across features ([#1346](https://github.com/Parsely/wp-parsely/pull/1346))
- Content Helper: Add WordPress Dashboard Widget ([#1305](https://github.com/Parsely/wp-parsely/pull/1305))
- Content Helper: Add Parse.ly Stats List Column ([#1271](https://github.com/Parsely/wp-parsely/pull/1271))
- Add TypeScript support to all remaining JavaScript files ([#1239](https://github.com/Parsely/wp-parsely/pull/1239))

### Changed

- Show/hide Parse.ly widget and stats column based on user capabilities ([#1407](https://github.com/Parsely/wp-parsely/pull/1407))
- Content Helper: Update naming ([#1380](https://github.com/Parsely/wp-parsely/pull/1380))
- UI: Minor wording tweak for Content Helper error ([#1304](https://github.com/Parsely/wp-parsely/pull/1304))
- UI: Fix grammar in Content Helper error ([#1303](https://github.com/Parsely/wp-parsely/pull/1303))
- UI: Fix typo in Disable JavaScript option ([#1302](https://github.com/Parsely/wp-parsely/pull/1302))
- Refactor Content Helper for better structure ([#1288](https://github.com/Parsely/wp-parsely/pull/1288))
- Centralize dashboard URL generation in a single function ([#1287](https://github.com/Parsely/wp-parsely/pull/1287))
- Improve Remote APIs naming ([#1272](https://github.com/Parsely/wp-parsely/pull/1272))
- Rename API Key to Site ID to improve consistency ([#1244](https://github.com/Parsely/wp-parsely/pull/1244))

### Fixed

- Fix referral distribution in Performance Details panel ([#1381](https://github.com/Parsely/wp-parsely/pull/1381))
- Fix Undefined warnings on Performance Details panel ([#1378](https://github.com/Parsely/wp-parsely/pull/1378))
- Content Helper: Fix top referrers percentage displaying as "NaN" ([#1374](https://github.com/Parsely/wp-parsely/pull/1374))
- Fix PHP 8 incompatibilities ([#1362](https://github.com/Parsely/wp-parsely/pull/1362))
- Fix PHP Notice on Settings page: "Undefined index: title" ([#1342](https://github.com/Parsely/wp-parsely/pull/1342))
- Content Helper: Make error hint display for all Forbidden (403) errors ([#1336](https://github.com/Parsely/wp-parsely/pull/1336))
- Fix PHPStan Errors ([#1252](https://github.com/Parsely/wp-parsely/pull/1252))
- Fix SonarCloud warnings ([#1246](https://github.com/Parsely/wp-parsely/pull/1246))

### Dependency Updates

- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.7.0+label%3A%22Component%3A+Dependencies%22).

## [3.6.2](https://github.com/Parsely/wp-parsely/compare/3.6.1...3.6.2) - 2023-02-13

### Fixed

- Fix PHP 8 Incompatibilities ([#1362](https://github.com/Parsely/wp-parsely/pull/1362))
- Improve checks on proxy endpoints
- Fix referral distribution in Performance Details panel ([#1382](https://github.com/Parsely/wp-parsely/pull/1382))

## [3.5.3](https://github.com/Parsely/wp-parsely/compare/3.5.2...3.5.3) - 2023-02-13

### Fixed

- Improve checks on proxy endpoints

## [3.4.3](https://github.com/Parsely/wp-parsely/compare/3.4.2...3.4.3) - 2023-02-13

### Fixed

- Improve checks on proxy endpoints

## [3.6.1](https://github.com/Parsely/wp-parsely/compare/3.6.0...3.6.1) - 2022-12-20

### Fixed

- Revert composer autoloader PR that resulted in fatal errors ([#1259](https://github.com/Parsely/wp-parsely/pull/1259))

## [3.6.0](https://github.com/Parsely/wp-parsely/compare/3.5.2...3.6.0) - 2022-12-20

### Added

- Content Helper: Add "Performance Details" panel ([#1093](https://github.com/Parsely/wp-parsely/pull/1093), [#1249](https://github.com/Parsely/wp-parsely/pull/1249))
- Metadata Author Archive Builder: Add support for the Co-Authors Plus plugin ([#1159](https://github.com/Parsely/wp-parsely/pull/1159))

### Changed

- Archive Pages: Improve headline metadata by using date format provided by site settings ([#1179](https://github.com/Parsely/wp-parsely/pull/1179))
- Avoid extra WordPress_Cache instances while proxying the Parse.ly API ([#1230](https://github.com/Parsely/wp-parsely/pull/1230))
- Content Helper: Improve error handling ([#1232](https://github.com/Parsely/wp-parsely/pull/1232))
- Content Helper: Make panels collapsible ([#1063](https://github.com/Parsely/wp-parsely/pull/1063))
- Content Helper: Refactor code for clarity ([#1069](https://github.com/Parsely/wp-parsely/pull/1069))
- Content Helper: Improve UI of Related Top Performing Posts ([#1216](https://github.com/Parsely/wp-parsely/pull/1216))
- Markdown Files: Fix errors and conform to US spelling ([#1143](https://github.com/Parsely/wp-parsely/pull/1143))
- Settings Page: Rename "Track as Page" to "Track as Non-Post" ([#1241](https://github.com/Parsely/wp-parsely/pull/1241), [#1250](https://github.com/Parsely/wp-parsely/pull/1250))
- Settings page: Update texts for clarity ([#1071](https://github.com/Parsely/wp-parsely/pull/1071), [#1229](https://github.com/Parsely/wp-parsely/pull/1229))
- Switch to Composer autoloader ([#985](https://github.com/Parsely/wp-parsely/pull/985))

### Fixed

- Avoid tracking page views when post is opened in preview mode ([#1195](https://github.com/Parsely/wp-parsely/pull/1195))
- Content Helper: Fix Parse.ly Posts API call for pages ([#1237](https://github.com/Parsely/wp-parsely/pull/1237))
- Content Helper: Fix blocked API requests caused by ad blockers ([#1225](https://github.com/Parsely/wp-parsely/pull/1225))
- Content Helper: Fix tag parameter while requesting Parse.ly Analytics API ([#1220](https://github.com/Parsely/wp-parsely/pull/1220))

### Dependency Updates

- View the list of all dependency updates [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A3.6.0+label%3A%22Component%3A+Dependencies%22).

## [3.5.2](https://github.com/Parsely/wp-parsely/compare/3.5.1...3.5.2) - 2022-09-27

### Changed

- Use Parsely->get_options() in the whole codebase ([#1098](https://github.com/Parsely/wp-parsely/pull/1098))
- Content Helper: Show "Contact Us" message when Site ID or API Secret are not set ([#1114](https://github.com/Parsely/wp-parsely/pull/1114))

## [3.5.1](https://github.com/Parsely/wp-parsely/compare/3.5.0...3.5.1) - 2022-09-13

### Fixed

- Content Helper: Fix broken links in "Post Stats" button ([#1077](https://github.com/Parsely/wp-parsely/pull/1077))

## [3.5.0](https://github.com/Parsely/wp-parsely/compare/3.4.2...3.5.0) - 2022-08-08

### Added

- Add init_content_helper() action ([#1005](https://github.com/Parsely/wp-parsely/pull/1005))
- Recommendations Block: Add preview in the WordPress Post Editor ([#993](https://github.com/Parsely/wp-parsely/pull/993))
- Recommendations Block: Add "Open Links in New Tab" option ([#990](https://github.com/Parsely/wp-parsely/pull/990))
- Add Content Helper tests ([#925](https://github.com/Parsely/wp-parsely/pull/925))

### Changed

- E2E tests: Remove changeKeysState() and setSiteID() functions ([#992](https://github.com/Parsely/wp-parsely/pull/992))
- Settings page: Move "Metadata Format" setting to "Basic Settings" section ([#966](https://github.com/Parsely/wp-parsely/pull/966))
- Add stylesheet to Content Helper ([#935](https://github.com/Parsely/wp-parsely/pull/935))

### Dependency Updates

- Bump @types/wordpress__components from 19.10.0 to 19.10.1 ([#971](https://github.com/Parsely/wp-parsely/pull/971))
- Bump @typescript-eslint/eslint-plugin from 5.25.0 to 5.31.0 ([#998](https://github.com/Parsely/wp-parsely/pull/998))
- Bump @wordpress/api-fetch from 6.9.0 to 6.10.0 ([#974](https://github.com/Parsely/wp-parsely/pull/974))
- Bump @wordpress/blocks from 11.11.0 to 11.12.0 ([#978](https://github.com/Parsely/wp-parsely/pull/978))
- Bump @wordpress/compose from 5.8.0 to 5.10.0 ([#945](https://github.com/Parsely/wp-parsely/pull/945))
- Bump @wordpress/e2e-test-utils from 7.6.0 to 7.9.0 ([#975](https://github.com/Parsely/wp-parsely/pull/975))
- Bump @wordpress/edit-post from 6.6.0 to 6.10.0 ([#982](https://github.com/Parsely/wp-parsely/pull/982))
- Bump @wordpress/env from 4.8.0 to 4.9.0 ([#930](https://github.com/Parsely/wp-parsely/pull/930))
- Bump @wordpress/eslint-plugin from 12.6.0 to 12.7.0 ([#972](https://github.com/Parsely/wp-parsely/pull/972))
- Bump @wordpress/plugins from 4.7.0 to 4.11.0 ([#976](https://github.com/Parsely/wp-parsely/pull/976))
- Bump @wordpress/scripts from 23.2.0 to 23.5.0 ([#973](https://github.com/Parsely/wp-parsely/pull/973))
- Bump actions/dependency-review-action from 1 to 2 ([#934](https://github.com/Parsely/wp-parsely/pull/934))
- Bump actions/setup-node from 3.3.0 to 3.4.1 ([#984](https://github.com/Parsely/wp-parsely/pull/984))
- Bump concurrently from 7.2.2 to 7.3.0 ([#989](https://github.com/Parsely/wp-parsely/pull/989))
- Bump eslint-plugin-jest from 26.5.3 to 26.6.0 ([#983](https://github.com/Parsely/wp-parsely/pull/983))
- Bump moment from 2.29.3 to 2.29.4 ([#970](https://github.com/Parsely/wp-parsely/pull/970))
- Bump octokit/request-action from 2.1.4 to 2.1.6 ([#967](https://github.com/Parsely/wp-parsely/pull/967))
- Bump terser from 5.12.1 to 5.14.2 ([#994](https://github.com/Parsely/wp-parsely/pull/994))
- Bump ts-loader from 9.3.0 to 9.3.1 ([#951](https://github.com/Parsely/wp-parsely/pull/951))
- Bump typescript from 4.7.3 to 4.7.4 ([#958](https://github.com/Parsely/wp-parsely/pull/958))

## [3.4.2](https://github.com/Parsely/wp-parsely/compare/3.4.1...3.4.2) - 2022-07-07

### Fixed

- Prevent Post Editor crash when the Content Helper is hidden and Options is clicked ([#964](https://github.com/Parsely/wp-parsely/pull/964))

## [3.4.1](https://github.com/Parsely/wp-parsely/compare/3.4.0...3.4.1) - 2022-07-06

### Fixed

- Fix missing require of class-date-builder.php ([#959](https://github.com/Parsely/wp-parsely/pull/959))

## [3.4.0](https://github.com/Parsely/wp-parsely/compare/3.3.2...3.4.0) - 2022-07-05

### Added

- Add Content Helper feature ([#876](https://github.com/Parsely/wp-parsely/pull/876))
- Add automated release workflow ([#875](https://github.com/Parsely/wp-parsely/pull/875))
- Add TypeScript support ([#895](https://github.com/Parsely/wp-parsely/pull/895))
- Add tests for Metadata Renderer ([#880](https://github.com/Parsely/wp-parsely/pull/880))
- Signal filter overrides on settings page ([#864](https://github.com/Parsely/wp-parsely/pull/864))
- Add debug information in the Site Health page ([#866](https://github.com/Parsely/wp-parsely/pull/866))
- Add Dependency Review GitHub Action ([#851](https://github.com/Parsely/wp-parsely/pull/851))

### Changed

- CONTRIBUTING.md: Add note about svn ([#941](https://github.com/Parsely/wp-parsely/pull/941))
- Fix failing Recommended Widget test ([#915](https://github.com/Parsely/wp-parsely/pull/915))
- PHPUnit Tests: Improve comments conformity to Inline Documentation Standards ([#903](https://github.com/Parsely/wp-parsely/pull/903))
- Migrate Recommendations Block to TypeScript ([#897](https://github.com/Parsely/wp-parsely/pull/897))
- Remove Jest configuration override ([#891](https://github.com/Parsely/wp-parsely/pull/891))
- Refactor metadata generation to use builders ([#843](https://github.com/Parsely/wp-parsely/pull/843))
- Add wait on E2E Tests helper function ([#858](https://github.com/Parsely/wp-parsely/pull/858))

### Deprecated

- Deprecate construct_parsely_metadata ([#865](https://github.com/Parsely/wp-parsely/pull/865))

### Fixed

- Fix some SonarCloud issues ([#923](https://github.com/Parsely/wp-parsely/pull/923))
- Fix Metadata test coverage ([#879](https://github.com/Parsely/wp-parsely/pull/879))
- Fix metadata builder not defined warning ([#877](https://github.com/Parsely/wp-parsely/pull/877))

### Dependency Updates

- Bump @wordpress/api-fetch from 6.5.0 to 6.6.0 ([#884](https://github.com/Parsely/wp-parsely/pull/884))
- Bump @wordpress/babel-preset-default from 6.10.0 to 6.11.0 ([#882](https://github.com/Parsely/wp-parsely/pull/882))
- Bump @wordpress/blocks from 11.6.0 to 11.7.0 ([#860](https://github.com/Parsely/wp-parsely/pull/860))
- Bump @wordpress/block-editor from 8.6.0 to 9.2.0 ([#913](https://github.com/Parsely/wp-parsely/pull/913))
- Bump @wordpress/components from 19.9.0 to 19.10.0 ([#861](https://github.com/Parsely/wp-parsely/pull/861))
- Bump @wordpress/compose from 5.6.0 to 5.7.0 ([#883](https://github.com/Parsely/wp-parsely/pull/883))
- Bump @wordpress/e2e-test-utils from 7.3.0 to 7.6.0 ([#916](https://github.com/Parsely/wp-parsely/pull/916))
- Bump @wordpress/env from 4.6.0 to 4.8.0 ([#908](https://github.com/Parsely/wp-parsely/pull/908))
- Bump @wordpress/eslint-plugin from 12.1.0 to 12.4.0 ([#911](https://github.com/Parsely/wp-parsely/pull/911))
- Bump @wordpress/hooks from 3.7.0 to 3.10.0 ([#910](https://github.com/Parsely/wp-parsely/pull/910))
- Bump @wordpress/scripts from 22.5.0 to 23.2.0 ([#909](https://github.com/Parsely/wp-parsely/pull/909))
- Bump @wordpress/url from 3.8.0 to 3.9.0 ([#854](https://github.com/Parsely/wp-parsely/pull/854))
- Bump actions/setup-node from 3.1.1 to 3.3.0 ([#920](https://github.com/Parsely/wp-parsely/pull/920))
- Bump concurrently from 7.1.0 to 7.2.2 ([#928](https://github.com/Parsely/wp-parsely/pull/928))
- Bump eslint-plugin-jest from 22.2.2 to 26.5.3 ([#919](https://github.com/Parsely/wp-parsely/pull/919))
- Bump husky from 7.0.4 to 8.0.1 ([#863](https://github.com/Parsely/wp-parsely/pull/863))
- Bump prettier from 2.6.2 to 2.7.0 ([#927](https://github.com/Parsely/wp-parsely/pull/927))
- Bump stefanzweifel/changelog-updater-action from 1.5.0 to 1.6.0 ([#906](https://github.com/Parsely/wp-parsely/pull/906))
- Bump typescript from 4.6.4 to 4.7.3 ([#918](https://github.com/Parsely/wp-parsely/pull/918))
- Fix broken package.json ([#926](https://github.com/Parsely/wp-parsely/pull/926))
- Upgrade minor JS dependencies ([#893](https://github.com/Parsely/wp-parsely/pull/893))

## [3.3.2](https://github.com/Parsely/wp-parsely/compare/3.3.1...3.3.2) - 2022-05-16

### Fixed

- Fix passing wrong parameter to construct_metadata() in render_metadata(). [#869](https://github.com/Parsely/wp-parsely/pull/869)

## [3.3.1](https://github.com/Parsely/wp-parsely/compare/3.3.0...3.3.1) - 2022-05-06

### Fixed

- Saving settings on a new installation would show a warning on wp-admin. [#845](https://github.com/Parsely/wp-parsely/pull/845)
- Risky JSON-LD metadata views. [#842](https://github.com/Parsely/wp-parsely/pull/842)

### Removed

- Remove Recommendations Block README. [#844](https://github.com/Parsely/wp-parsely/pull/844)

## [3.3.0](https://github.com/Parsely/wp-parsely/compare/3.2.1...3.3.0) - 2022-05-02

### Added

- Tracker URL field to REST API endpoint. [#743](https://github.com/Parsely/wp-parsely/pull/743)
- Recommendations out of beta phase, now enabled by default. [#764](https://github.com/Parsely/wp-parsely/pull/764)
- Dynamic support tracking. Disable autotrack option. [#792](https://github.com/Parsely/wp-parsely/pull/792)
- Added support for Audience Segments. JavaScript `onReady` hook. [#808](https://github.com/Parsely/wp-parsely/pull/808)
- End-to-end tests for front-end metadata. [#789](https://github.com/Parsely/wp-parsely/pull/789)
- Integration tests for post image metadata. [#820](https://github.com/Parsely/wp-parsely/pull/820)

### Changed

- Recommendations Block: Disabled link clicking in Editor. [#767](https://github.com/Parsely/wp-parsely/pull/767)
- Recommendations Block: Register the block using block.json file. [#62](https://github.com/Parsely/wp-parsely/pull/762)
- Recommendations Block: Fixed thumbnail images not showing. [#793](https://github.com/Parsely/wp-parsely/pull/793)
- Recommendations Block: Added additional testing. [#724](https://github.com/Parsely/wp-parsely/pull/724)
- Recommendations Block: Removed tag setting. [#822](https://github.com/Parsely/wp-parsely/pull/822)
- Metadata: We have changed the way metadata is generated. Filters continue to work as expected. We kept the legacy functions for backwards compatibility, but we recommend migrating to `Metadata` class.
- Metadata: Extracted Metadata generation in a separate class. [#742](https://github.com/Parsely/wp-parsely/pull/742)
- Metadata: Extracted Metadata rendering in a separate class. [#751](https://github.com/Parsely/wp-parsely/pull/751)
- Improved Site ID handling on settings page. [#766](https://github.com/Parsely/wp-parsely/pull/766)

### Dependency Updates

- @wordpress/api-fetch from 6.2.0 to 6.3.0
- @wordpress/babel-preset-default from 6.7.0 to 6.9.0
- @wordpress/block-editor from 8.4.0 to 8.5.1
- @wordpress/blocks from 11.4.0 to 11.5.0
- @wordpress/components from 19.7.0 to 19.8.0
- @wordpress/compose from 5.3.0 to 5.4.0
- @wordpress/e2e-test-utils from 7.1.0 to 7.3.0
- @wordpress/env from 4.4.0 to 4.6.0
- @wordpress/eslint-plugin from 11.1.0 to 12.1.0
- @wordpress/hooks from 3.6.0 to 3.7.0
- @wordpress/scripts from 22.3.0 to 22.5.0
- @wordpress/url from 3.6.0 to 3.7.0
- eslint-plugin-jest from 26.1.3 to 26.1.5

### Fixed

- Image URL generation for metadata. Links would generate thumbnail-sized images. [#758](https://github.com/Parsely/wp-parsely/pull/758)
- Set image URL instead of thumbnail URL on metadata update. [#794](https://github.com/Parsely/wp-parsely/pull/794)
- Legacy Recommended Widget not showing. [#797](https://github.com/Parsely/wp-parsely/pull/797)
- PHPDoc annotations and comments. [#761](https://github.com/Parsely/wp-parsely/pull/761) [#838](https://github.com/Parsely/wp-parsely/pull/838)
- Removed redundant media query on settings page. [#827](https://github.com/Parsely/wp-parsely/pull/827)
- Improved accessibility of logo field on settings page. [#826](https://github.com/Parsely/wp-parsely/pull/826)
- Coverage annotations in tests. [#837](https://github.com/Parsely/wp-parsely/pull/837)

### Removed

- References to the plugin not being compatible with Dynamic Tracking. [#791](https://github.com/Parsely/wp-parsely/pull/791)
- Removed Cache Buster function from Parse.ly class. [#747](https://github.com/Parsely/wp-parsely/pull/747)

## [3.2.1](https://github.com/Parsely/wp-parsely/compare/3.2.0...3.2.1) - 2022-04-01

### Fixed

- The Recommended Widget Proxy would fail to work with certain third-party cache plugins. [#750](https://github.com/Parsely/wp-parsely/pull/750)

## [3.2.0](https://github.com/Parsely/wp-parsely/compare/3.1.3...3.2.0) - 2022-03-29

The 3.2.0 release introduces many new features, including:

- A Recommendations Block that is designed to showcase links to content on your site as provided by the [Parse.ly `/related` API endpoint](https://www.parse.ly/help/api/recommendations#get-related).
- Official support for interacting with the Parse.ly tracker's `onload` event, that eliminates the possible need of resorting to workarounds.
- GraphQL support which opens new possibilities for decoupled/headless setups.
- Google Web Stories support.

### Added

- Recommendations Block. [#611](https://github.com/Parsely/wp-parsely/pull/611), [#642](https://github.com/Parsely/wp-parsely/pull/642), [#649](https://github.com/Parsely/wp-parsely/pull/649)
- JavaScript hook for accessing the tracker's `onload` event. [#650](https://github.com/Parsely/wp-parsely/pull/650)
- GraphQL support. [#710](https://github.com/Parsely/wp-parsely/pull/710)
- Google Web Stories support. [#602](https://github.com/Parsely/wp-parsely/pull/602)
- Settings link and API Key in Network Admin sites list. [#583](https://github.com/Parsely/wp-parsely/pull/583)
- Screen Options to toggle settings sections in plugin settings. [#531](https://github.com/Parsely/wp-parsely/pull/531)
- Allow user to choose logo using the WordPress Media Library in plugin settings. [#570](https://github.com/Parsely/wp-parsely/pull/570)
- Run integration tests against multiple WordPress versions. [#689](https://github.com/Parsely/wp-parsely/pull/689)
- Expose the `wp-env` script as-is in `package.json`. [#648](https://github.com/Parsely/wp-parsely/pull/648)

### Changed

- Improve UI for post/page types to track in Settings page. [#633](https://github.com/Parsely/wp-parsely/pull/633), [#668](https://github.com/Parsely/wp-parsely/pull/668)
- Improve empty API key checks and check for API key existence earlier. [#686](https://github.com/Parsely/wp-parsely/pull/686), [#709](https://github.com/Parsely/wp-parsely/pull/709)
- Improve reliability and optimize E2E tests. [#647](https://github.com/Parsely/wp-parsely/pull/647), [#675](https://github.com/Parsely/wp-parsely/pull/675), [#681](https://github.com/Parsely/wp-parsely/pull/681), [#684](https://github.com/Parsely/wp-parsely/pull/684)
- Update README.md and plugin page on wordpress.org. [#673](https://github.com/Parsely/wp-parsely/pull/673), [#700](https://github.com/Parsely/wp-parsely/pull/700), [#704](https://github.com/Parsely/wp-parsely/pull/704)
- Unify AMP and Google Web Stories implementation. [#622](https://github.com/Parsely/wp-parsely/pull/622)
- Move `Rest` class into the `Endpoints` package. [#707](https://github.com/Parsely/wp-parsely/pull/707)
- Cleanup `Scripts` class. [#644](https://github.com/Parsely/wp-parsely/pull/644)
- Use WordPress scripts to export plugin. [#634](https://github.com/Parsely/wp-parsely/pull/634)
- Build the admin settings page script and enqueue built version. [#635](https://github.com/Parsely/wp-parsely/pull/635)
- Use built version strings and deprecate `Parsely::get_asset_cache_buster`. [#636](https://github.com/Parsely/wp-parsely/pull/636)
- Integrate Recommended Widget CSS into the build system and move it to the CSS folder. [#656](https://github.com/Parsely/wp-parsely/pull/656), [#658](https://github.com/Parsely/wp-parsely/pull/658)

### Removed

- Remove `$GLOBALS['parsely_ui_plugins_actions']` global variable. [#615](https://github.com/Parsely/wp-parsely/pull/615)

### Dependency updates

- Update `@wordpress/babel-preset-default` package to `6.7.0`. [#660](https://github.com/Parsely/wp-parsely/pull/660), [#715](https://github.com/Parsely/wp-parsely/pull/715), [#737](https://github.com/Parsely/wp-parsely/pull/737)
- Update `@wordpress/dom-ready` package to `3.5.0`. [#741](https://github.com/Parsely/wp-parsely/pull/741)
- Update `@wordpress/e2e-test-utils` package to `7.1.0`. [#659](https://github.com/Parsely/wp-parsely/pull/659), [#718](https://github.com/Parsely/wp-parsely/pull/718), [#736](https://github.com/Parsely/wp-parsely/pull/736)
- Update `@wordpress/env` package to `4.4.0`. [#663](https://github.com/Parsely/wp-parsely/pull/663), [#716](https://github.com/Parsely/wp-parsely/pull/716), [#734](https://github.com/Parsely/wp-parsely/pull/734)
- Update `@wordpress/eslint-plugin` package to `11.1.0`. [#661](https://github.com/Parsely/wp-parsely/pull/661), [#719](https://github.com/Parsely/wp-parsely/pull/719), [#741](https://github.com/Parsely/wp-parsely/pull/741)
- Update `@wordpress/hooks` package to `3.5.0`. [#717](https://github.com/Parsely/wp-parsely/pull/717), [#735](https://github.com/Parsely/wp-parsely/pull/735)
- Update `@wordpress/scripts` package to `22.3.0`. [#671](https://github.com/Parsely/wp-parsely/pull/671), [#705](https://github.com/Parsely/wp-parsely/pull/705), [#720](https://github.com/Parsely/wp-parsely/pull/720), [#733](https://github.com/Parsely/wp-parsely/pull/733)
- Update `follow-redirects` package to `1.14.8`. [#610](https://github.com/Parsely/wp-parsely/pull/610), [#669](https://github.com/Parsely/wp-parsely/pull/669)
- Update `minimist` package to `1.2.6`. [#739](https://github.com/Parsely/wp-parsely/pull/739)
- Update `node-forge` package to `1.3.0`. [#738](https://github.com/Parsely/wp-parsely/pull/738)
- Update `prettier` package to `2.6.1`. [#727](https://github.com/Parsely/wp-parsely/pull/727), [#741](https://github.com/Parsely/wp-parsely/pull/741)
- Update `actions/checkout` GitHub Action to `3`. [#701](https://github.com/Parsely/wp-parsely/pull/701)
- Update `actions/setup-node` GitHub Action to `3.0.0`. [#699](https://github.com/Parsely/wp-parsely/pull/699)

### Fixed

- Remove phased-out boost parameters from Recommended Widget. [#728](https://github.com/Parsely/wp-parsely/pull/728)
- Make integration tests work on Windows and remove unneeded end of lines. [#677](https://github.com/Parsely/wp-parsely/pull/677), [#680](https://github.com/Parsely/wp-parsely/pull/680)

## [3.1.3](https://github.com/Parsely/wp-parsely/compare/3.1.2...3.1.3) - 2022-03-17

### Fixed

- Fix rare errors when getting authors metadata. The error occurred on posts that contained malformed authors. [#722](https://github.com/Parsely/wp-parsely/pull/722)
- Improve type definitions on categories metadata generation. [#723](https://github.com/Parsely/wp-parsely/pull/723)

## [3.1.2](https://github.com/Parsely/wp-parsely/compare/3.1.1...3.1.2) - 2022-02-24

### Added

- `wp_parsely_enable_admin_bar` filter. [#691](https://github.com/Parsely/wp-parsely/pull/691)

### Changed

- Don't return metadata on REST if no API key. [#688](https://github.com/Parsely/wp-parsely/pull/688)

### Fixed

- Crash for pages that wouldn't generate a permalink. [#698](https://github.com/Parsely/wp-parsely/pull/698)
- Compatibility issues when the default category wasn't `Uncategorized`. [#620](https://github.com/Parsely/wp-parsely/pull/620)
- Fixed some type safety issues. [#657](https://github.com/Parsely/wp-parsely/pull/657)
- Update outdated references in function comments. [#676](https://github.com/Parsely/wp-parsely/pull/676)
- Exclude some files & dirs from exported plugin archives. [#612](https://github.com/Parsely/wp-parsely/pull/612)
- Not installing wp-env globally on CI. [#665](https://github.com/Parsely/wp-parsely/pull/665)
- Updating documentation. [#614](https://github.com/Parsely/wp-parsely/pull/614), [#613](https://github.com/Parsely/wp-parsely/pull/613), [#616](https://github.com/Parsely/wp-parsely/pull/616), [#654](https://github.com/Parsely/wp-parsely/pull/654), [#683](https://github.com/Parsely/wp-parsely/pull/683)

## [3.1.1](https://github.com/Parsely/wp-parsely/compare/3.1.0...3.1.1) - 2022-02-09

### Fixed

- Users could not create new instances of the recommended widget on WordPress 5.9. [#651](https://github.com/Parsely/wp-parsely/pull/651)
- Correct "since" annotations to 3.1.0. [#646](https://github.com/Parsely/wp-parsely/pull/646)
- Fix recommended widget e2e tests for WordPress 5.9. [#631](https://github.com/Parsely/wp-parsely/pull/631)

### Dependency updates

- Bumped dependencies. [#632](https://github.com/Parsely/wp-parsely/pull/632) [#637](https://github.com/Parsely/wp-parsely/pull/637)
- `@wordpress/dom-ready` from 2.13.2 to 3.3.0
- `@wordpress/babel-preset-default` from 6.4.1 to 6.5.0
- `@wordpress/e2e-test-utils` from 5.4.10 to 6.0.0
- `@wordpress/env` from 4.1.3 to 4.2.0
- `@wordpress/eslint-plugin` from 9.3.0 to 10.0.0
- `@wordpress/scripts` from 19.2.3 to 20.0.2

### Removed

- Removed unused dependency `@wordpress/i18n`. [#632](https://github.com/Parsely/wp-parsely/pull/632)

## [3.1.0](https://github.com/Parsely/wp-parsely/compare/3.0.4...3.1.0) - 2022-01-21

The 3.1.0 release is a minor release for the plugin that does not introduce any breaking changes coming from the 3.0 branch. This version's primary focus is adding support for WordPress decoupled architectures and a revamped settings page. We have also worked hard on refining our code, testing, and delivery process.

The Parse.ly plugin now hooks into the WordPress REST API to provide content metadata in a format that's easy for a variety of client applications to consume. A `parsely` field containing the metadata is now rendered in the tracked objects (e.g., `post` and `page`). No new endpoint is introduced. This behavior can be disabled using a filter. Please refer to the plugin's README file for more details. Note that the tracking script must still be inserted manually in the decoupled front-end or otherwise loaded for your site.

### Added

- Decoupled support. [#489](https://github.com/Parsely/wp-parsely/pull/489) [#500](https://github.com/Parsely/wp-parsely/pull/500)
- Revamped wp-admin settings page, divided in sections. [#518](https://github.com/Parsely/wp-parsely/pull/518)
- Parse.ly stats button on admin bar. [#569](https://github.com/Parsely/wp-parsely/pull/569)
- Show error in settings page when duplicated tracking is selected. [#543](https://github.com/Parsely/wp-parsely/pull/543)
- Instructions for local development. [#525](https://github.com/Parsely/wp-parsely/pull/525)
- Local developer environment logs command. [#532](https://github.com/Parsely/wp-parsely/pull/532)
- Husky-based git commit hooks to enforce linting rules prior to commit. [#538](https://github.com/Parsely/wp-parsely/pull/538)
- Linting for JavaScript and CSS files. [#527](https://github.com/Parsely/wp-parsely/pull/527)
- Types to function arguments in GetCurrentUrlTest. [#504](https://github.com/Parsely/wp-parsely/pull/504)
- End-to-end test to verify if scripts are rendered in the front-end. [#528](https://github.com/Parsely/wp-parsely/pull/528)
- Concurrency to CI configuration and Composer tweaks. [#559](https://github.com/Parsely/wp-parsely/pull/559)
- Explicit dependabot reviewers on GitHub. [#526](https://github.com/Parsely/wp-parsely/pull/526)
- WordPress.org banner images. [#581](https://github.com/Parsely/wp-parsely/pull/581)
- PHPStan static analysis tool. [#590](https://github.com/Parsely/wp-parsely/pull/590)

### Changed

- Hiding `Disable AMP` field on settings page when the AMP plugin is not enabled. [#519](https://github.com/Parsely/wp-parsely/pull/519)
- Use built-in WordPress submit button instead of custom one in the settings page. [#513](https://github.com/Parsely/wp-parsely/pull/513)
- Improved wp-admin settings page help texts. [#552](https://github.com/Parsely/wp-parsely/pull/552)
- `@wordpress/scripts` bumped from 19.2.1 to 19.2.3. [#503](https://github.com/Parsely/wp-parsely/pull/503) [#603](https://github.com/Parsely/wp-parsely/pull/603)
- `prettier` bumped from 2.4.1 to 2.5.0. [#509](https://github.com/Parsely/wp-parsely/pull/509)
- `concurrently` bumped from 6.4.0 to 6.5.1. [#551](https://github.com/Parsely/wp-parsely/pull/551)
- Ubuntu bumped from 18.04 to 20.04 on CI tests. [#445](https://github.com/Parsely/wp-parsely/pull/445)
- Unit and Integration tests run in random order. [#511](https://github.com/Parsely/wp-parsely/pull/511)
- Correct Parse.ly spelling in tests comments. [#561](https://github.com/Parsely/wp-parsely/pull/561)
- Minor amendments on the documentation. [#514](https://github.com/Parsely/wp-parsely/pull/514)
- Updated release process guidelines. [#567](https://github.com/Parsely/wp-parsely/pull/567)
- Removed checkboxes from GitHub's PR template. [#512](https://github.com/Parsely/wp-parsely/pull/512)
- Improved JS scripts integration tests. [#557](https://github.com/Parsely/wp-parsely/pull/557)
- Source code linting violations (PHPCS with `--severity=1`). [#544](https://github.com/Parsely/wp-parsely/pull/544)
- WordPress.org screenshots for settings page. [#574](https://github.com/Parsely/wp-parsely/pull/574)

### Fixed

- Incorrect type errors. [#607](https://github.com/Parsely/wp-parsely/pull/607)
- Undefined index error on settings page. [#536](https://github.com/Parsely/wp-parsely/pull/536)
- Source the correct asset for the Recommendations Widget. [#545](https://github.com/Parsely/wp-parsely/pull/545)
- End-to-end tests in CI (GitHub Actions). [#521](https://github.com/Parsely/wp-parsely/pull/521)

### Removed

- Plugin version number being printed in front-end's HTML source code. [#502](https://github.com/Parsely/wp-parsely/pull/502)
- Custom CSS on wp-admin settings page. [#496](https://github.com/Parsely/wp-parsely/pull/496)
- `migrate_old_fields` private function from Recommended Widget. [#599](https://github.com/Parsely/wp-parsely/pull/599)
- PHP 8.2 from CI tests. [#523](https://github.com/Parsely/wp-parsely/pull/523)
- Custom end-to-end Docker image. [#524](https://github.com/Parsely/wp-parsely/pull/524)

## [3.0.4](https://github.com/Parsely/wp-parsely/compare/3.0.3...3.0.4) - 2022-01-17

### Changed

- Changed plugin loading functions from anonymous to named functions. [#595](https://github.com/Parsely/wp-parsely/pull/595)

## [3.0.3](https://github.com/Parsely/wp-parsely/compare/3.0.2...3.0.3) - 2022-01-12

### Fixed

- [Fixed a fatal error](https://github.com/Parsely/wp-parsely/issues/587) when requesting metadata for a post without categories and `categories as tags` enabled. [#588](https://github.com/Parsely/wp-parsely/pull/588)

## [3.0.2](https://github.com/Parsely/wp-parsely/compare/3.0.1...3.0.2) - 2022-01-05

### Fixed

- [Properly render the post modified date metadata](https://github.com/Parsely/wp-parsely/issues/558) & Fix a [fatal error](https://github.com/Parsely/wp-parsely/issues/562) caused by an unexpected data type [#560](https://github.com/Parsely/wp-parsely/pull/560)

## [3.0.1](https://github.com/Parsely/wp-parsely/compare/3.0.0...3.0.1) - 2021-12-17

### Fixed

- Fix metadata on password protected posts [#547](https://github.com/Parsely/wp-parsely/pull/547)

## [3.0.0](https://github.com/Parsely/wp-parsely/compare/2.6.1...3.0.0) - 2021-12-15

## Important information about this release

wp-parsely 3.0.0 is a major release of the Parse.ly WordPress plugin. The major version bump is because we are introducing a number of breaking changes that have allowed us to modernize the codebase and make future features easier to implement.

The biggest breaking change is the new minimum requirements for running the plugin. You now need PHP 7.1 or newer and WordPress 5.0 or newer. If you are running one of those old versions, you shouldn't get the update option on your WordPress admin.

If you are using the plugin without any code-level customizations (for instance, calling the plugin's functions or methods or hooking in the plugin's WordPress hooks), this update should be seamless and everything should keep operating normally. The plugin's way of working is still fundamentally the same. If you are using those customizations, we recommend you going through the detailed changelog to see if they affect you. In most of the cases, only trivial changes will be required to make your code work.

### Added

- Namespaces to files. Now all functions and classes are under the `Parsely` namespace, or a child namespace of that e.g. `Parsely\Parsely` or `Parsely\UI\Recommended_Widget`. If your code is calling a wp-parsely function (directly, or as a hook callback) without the namespace, then you'll need to update that call. [#430](https://github.com/Parsely/wp-parsely/pull/430) [#475](https://github.com/Parsely/wp-parsely/pull/475) [#477](https://github.com/Parsely/wp-parsely/pull/477)
- Strict typing (`strict_types=1`) to all files in the codebase. Passing a value to a function in wp-parsely with an incorrect type will now raise an error. [#420](https://github.com/Parsely/wp-parsely/pull/420).
- Type declarations have been added to function returns [#429](https://github.com/Parsely/wp-parsely/pull/429) and arguments [#455](https://github.com/Parsely/wp-parsely/pull/455).
- `wp_parsely_should_insert_metadata` filter. The filter controls whether the Parse.ly metadata should be inserted in the page's HTML. By default, the meta tags are rendered (the filter returns `true`). [#440](https://github.com/Parsely/wp-parsely/pull/440)
- `wp_parsely_enable_cfasync_tag` filter. The Cloudflare `cfasync` attributes are now not rendered by default, but they can be enabled by returning `true` to this filter. [#473](https://github.com/Parsely/wp-parsely/pull/473).
- WordPress plugin uninstall script. When the plugin is uninstalled, the options will be removed from the database. Deactivating the plugin will not cause the options to be deleted. [#444](https://github.com/Parsely/wp-parsely/pull/444)
- `npm run dev:start` and `npm run dev:stop` commands to run the plugin locally for development purposes. [#493](https://github.com/Parsely/wp-parsely/pull/493)
- E2E test for recommended widget. [#434](https://github.com/Parsely/wp-parsely/pull/434)
- JavaScript code-scanning [#453](https://github.com/Parsely/wp-parsely/pull/453)

### Changed

- Minimum PHP and WP versions required to run the plugin are now 7.1 (from 5.6) and 5.0 from (4.0), respectively. [#416](https://github.com/Parsely/wp-parsely/pull/416)
- The development Node JS version has been bumped from 14 to 16.
- Extract admin warning logic from `class-parsely.php` to `Parsely\UI\Admin_Warning`. [#468](https://github.com/Parsely/wp-parsely/pull/468)
- Extract tracker logic from `class-parsely.php` to `Parsely\Scripts` [#478](https://github.com/Parsely/wp-parsely/pull/478)
- Extract settings page logic from `class-parsely.php` to `Parsely\UI\Settings_Page`. [#467](https://github.com/Parsely/wp-parsely/pull/467)
- Rename `Parsely_Recommended_Widget` class to `Parsely\UI\Recommended_Widget`. [#475](https://github.com/Parsely/wp-parsely/pull/475)
- Rename `register_js()` method to `register_scripts()`. [#481](https://github.com/Parsely/wp-parsely/pull/481)
- Rename `load_js_api()` method to `enqueue_js_api()`. [#481](https://github.com/Parsely/wp-parsely/pull/481)
- Rename `load_js_tracker()` method to `enqueue_js_tracker()`. [#481](https://github.com/Parsely/wp-parsely/pull/481)
- Move Parse.ly settings file to `views/parsely-settings.php`. [#459](https://github.com/Parsely/wp-parsely/pull/459)
- `Open on Parse.ly` links are displayed by default. To disable the feature, the `wp_parsely_enable_row_action_links` filter must return `false`. [#433](https://github.com/Parsely/wp-parsely/pull/433)
- `Parsely::get_current_url()` default value for argument `string $parsely_type` changed from `nonpost` to `non-post`. This change has been done to better align with Parse.ly's backend. [#447](https://github.com/Parsely/wp-parsely/pull/447)
- Enqueue scripts with theme independent hook. The JavaScript scripts are now enqueued at the `wp_enqueue_scripts` hook instead of `wp_footer`. [#458](https://github.com/Parsely/wp-parsely/pull/458)
- Replace multi-select fields with checkboxes on the settings page. Existing selections will be retained. [#482](https://github.com/Parsely/wp-parsely/pull/482)
- `Parsely\Integrations\Facebook_Instant_Articles`: `REGISTRY_IDENTIFIER`, `REGISTRY_DISPLAY_NAME`, `get_embed_code()` are now private. [#486](https://github.com/Parsely/wp-parsely/pull/486)
- `Parsely\UI\Recommended_Widget`: `get_api_url()` is now private. [#486](https://github.com/Parsely/wp-parsely/pull/486)
- Tests: Specify `coverage: none` where it is not needed. [#419](https://github.com/Parsely/wp-parsely/pull/419)

### Dependency updates

- Bump @wordpress/e2e-test-utils from 5.4.3 to 5.4.8. [#492](https://github.com/Parsely/wp-parsely/pull/492)
- Bump @wordpress/scripts from 18.0.1 to 19.1.0. [#480](https://github.com/Parsely/wp-parsely/pull/480)
- Bump @wordpress/eslint-plugin from 9.2.0 to 9.3.0. [#490](https://github.com/Parsely/wp-parsely/pull/490)

### Fixed

- Fix missing translation support for Yes and No labels in the settings page. [#463](https://github.com/Parsely/wp-parsely/pull/463)
- Avoid making duplicate calls to Parse.ly API on the Recommended Widget's front-end. [#460](https://github.com/Parsely/wp-parsely/pull/460)
- Fix JS string translation in settings page. [#462](https://github.com/Parsely/wp-parsely/pull/462)
- Consistent return types on `update_metadata_endpoint`. The function used to return different return types, now it always returns `void`. [#446](https://github.com/Parsely/wp-parsely/pull/446)
- Consistent return type on `insert_parsely_page`. The function used to return `string|null|array`, now it returns `void`. [#443](https://github.com/Parsely/wp-parsely/pull/443)
- Fixed fatal error when the option in the database was corrupted. [#540](https://github.com/Parsely/wp-parsely/pull/540)
- Tests: Stop using deprecated `setMethods()` method. [#427](https://github.com/Parsely/wp-parsely/pull/427)
- e2e tests: fix watch command. [#476](https://github.com/Parsely/wp-parsely/pull/476)
- Fix non-working README code example. [#439](https://github.com/Parsely/wp-parsely/pull/439)

### Removed

- Previously deprecated filter `after_set_parsely_page`. Use `wp_parsely_metadata` instead. [#436](https://github.com/Parsely/wp-parsely/pull/436)
- Previously deprecated filter `parsely_filter_insert_javascript`. Use `wp_parsely_load_js_tracker` instead. [#437](https://github.com/Parsely/wp-parsely/pull/437)
- `post_has_viewable_type` function. Use `is_post_viewable` instead. The `post_has_viewable_type` function was only added to support older versions of WordPress. [#417](https://github.com/Parsely/wp-parsely/pull/417)
- Custom Parse.ly load text domain. Since the plugin now supports versions of WordPress that load custom text domains automatically, the plugins doesn't have to explicitly load the text domain itself. [#457](https://github.com/Parsely/wp-parsely/pull/457)
- Empty functions for admin settings. The callbacks were never utilized. [#456](https://github.com/Parsely/wp-parsely/pull/456)
- Redundant code coverage annotations. [#469](https://github.com/Parsely/wp-parsely/pull/469)
- Old init Python script. [#441](https://github.com/Parsely/wp-parsely/pull/441)
- "Add admin warning for minimum requirements in 3.0" notice. This was only added in the previous version of the plugin. [#424](https://github.com/Parsely/wp-parsely/pull/424)
- Upgrade README notice. [#470](https://github.com/Parsely/wp-parsely/pull/470)

## [2.6.1](https://github.com/Parsely/wp-parsely/compare/2.6.0...2.6.1) - 2021-10-15

### Fixed

- Fix recommended widget not following configuration #451

## [2.6.0](https://github.com/Parsely/wp-parsely/compare/2.5.2...2.6.0) - 2021-09-29

### Added

- Improve the test environment #411
- Leverage the WordPress e2e testing framework to run end-to-end tests against the plugin #360
- Add a step to the node CI test to confirm built scripts are included in the change #374
- Using npm caching on GitHub Actions #388
- Add e2e test for the plugin action link #403
- API Key: Add utility method for checking it is set #404
- Adding 3.0 upgrade notice on README #400
- Add admin warning for minimum requirements in 3.0 #408

### Changed

- Split out row action link logic #406
- Split out plugin actions links logic #401
- Integrations: Extract into separate classes #345
- Simplifying get_options function #382
- Tests: Rename final *-test.php file to *Test.php #384
- Tests: Improve the get_current_url data provider #383
- Improving reliability of get_current_url tests #398
- Testcase: Allow getMethod() to use different class #405
- Bump prettier from 2.3.2 to 2.4.1 #376
- Bump @wordpress/scripts from 17.1.0 to 18.0.1 #366

### Fixed

- Widget: Hide the recommendation widget until the element is populated #193
- Add conditional for CPT archives and CPT term archives #328
- Fix rendering errors when rendering multiple recommendation widgets #397
- Hide admin warning on network admin #392
- Remove jQuery from Recommended Widget #385
- Change red color in admin to match wp-admin styles #386
- Remove unused default logo variable #387
- Remove unused return_personalized_json function #391

## [2.5.2](https://github.com/Parsely/wp-parsely/compare/2.5.1...2.5.2) - 2021-09-17

### Changed

- Specify that browserslist should use the defaults setting when building bundles. #363
- Wrapping post list links in an opt-in filter. #369

### Fixed

- Fix notices that would appear if the plugin was set up to print repeating metas but those wouldn't exist. #370
- Fix cookie parsing. In some edge cases, a cookie that contained special characters would not be parsed correctly. #364

## [2.5.1](https://github.com/Parsely/wp-parsely/compare/2.5.0...2.5.1) - 2021-08-10

### Fixed

- Load the API init script before the tracker so values are populated.
- Encode the current URL in the `uuidProfileCall` URL.

## [2.5.0](https://github.com/Parsely/wp-parsely/compare/2.4.1...2.5.0) - 2021-05-17

### Added

- Refreshed contributor documentation into a new [CONTRIBUTING.md](CONTRIBUTING.md) file.
- Introduce a build step for front-end and admin page JavaScript assets which leverages the [`@wordpress/scripts` package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/). Scripts are now separately enqueued and browser-cacheable.
- Allow for select HTML tags and attributes in the Recommended Content widget title.
- Add a "No boost" option for scores in the widget.
- Add filter `wp_parsely_post_type` to override the [type of content Parse.ly attributes to an article](https://www.parse.ly/help/integration/jsonld#distinguishing-between-posts-and-pages).
- Add support for custom post status slugs via the `wp_parsely_trackable_statuses` filter (to allow for those other than `publish` to be tracked).
- Make `$post_id` available to the `wp_parsely_permalink` filter.

### Changed

- Refactor printed markup into template "views."
- Refactor plugin entry file to perform minimal initialization and separately load the `Parsely` class file.
- Improve the README file (which populates the copy in the plugin repository page).
- Expand test coverage (PHP and JavaScript).
- Expanded string localization and consolidate into a single text domain.
- Adjust HTML heading levels for improved usability and accessibility.
- Improve accessibility of radio inputs on the admin page.
- Improve the widget user interface to make it more consistent with core styles.
- Better load Widget CSS and use plugin version for cache busting.
- Replace widget form and hide front-end output when API values are missing.
- Prevent printing of admin page CSS outside the specific admin page for this plugin.
- Switch to XHRs for `/profile` calls (instead of using JSONP).
- Remove jQuery dependency from the API and Admin scripts.
- Stop using protocol-relative URL for the tracking script.
- Register the [package at Packagist](https://packagist.org/packages/parsely/wp-parsely) for easier install via Composer.

### Fixed

- Fix the "requires a recrawl" notices to limit to specific admin page settings.
- Fix inconsistent ports in canonical URLs.

### Deprecated

- Deprecate filter `after_set_parsely_page` -- use new name `wp_parsely_metadata` instead.
- Deprecate filter `parsely_filter_insert_javascript` -- use new name `wp_parsely_load_js_tracker` instead.

## [2.4.1](https://github.com/Parsely/wp-parsely/compare/2.4.0...2.4.1) - 2021-04-13

### Fixed

- Fix the version number set in the main plugin file.

## [2.4.0](https://github.com/Parsely/wp-parsely/compare/2.3.0...2.4.0) - 2021-04-13

### Added

- Structured data integration tests for posts, pages, category and author archives, and home/front pages.
- License, `.editorconfig`, `.gitattributes`, `CODEOWNERS`, `CHANGELOG.md`, and other development files.
- Documentation for hooks.
- Coding standards and other linting checks.
- JS Build environment entrypoint.

### Changed

- Improve WordPress.org assets (screenshots, icons, readme).
- Switch to using GitHub Actions workflow for CI and WordPress.org deployment.
- Update scaffolded integration test files.
- Improve plugin header (support DocBlock format, add textdomain, update information, clarify license, remove to-do's).
- Separate multisite and single-site tests in CI workflow.

### Fixed

- Fix metadata for home pages, including pages of older posts.
- Fix metadata for category archives.

### Removed

- Remove Parse.ly metadata from search result pages.

## [2.3.0](https://github.com/Parsely/wp-parsely/compare/2.2.1...2.3.0) - 2021-03-24

- Fix and improve Travis configuration.
- Small maintenance items: merge isset() calls, remove unnecessary typecasting, remove is_null() in favour of null comparison, un-nest nested functions, simplify ternary operators, remove unnecessary local variable, etc.
- Improve tests: split utility methods to custom test case, use more specific assertions, etc.
- Update WordPress plugin Tested Up To version.

## [2.2.1](https://github.com/Parsely/wp-parsely/compare/2.2...2.2.1) - 2020-12-18

- Add logo to JSON-LD publisher object.

## [2.2](https://github.com/Parsely/wp-parsely/compare/2.1.3...2.2) - 2020-09-14

- Fix metadata being inserted on a 404 page.
- Add `parsely_filter_insert_javascript` filter hook.

## [2.1.3](https://github.com/Parsely/wp-parsely/compare/2.1.2...2.1.3) - 2020-09-11

- Add defaults for API Secret and Wipe settings.

## [2.1.2](https://github.com/Parsely/wp-parsely/compare/2.1.1...2.1.2) - 2020-07-02

- Cleanup code to conform to WordPress VIP standards.
- Add a guard against null values.

## [2.1.1](https://github.com/Parsely/wp-parsely/compare/2.1...2.1.1) - 2020-06-08

- Fix incorrect variable name.

## [2.1](https://github.com/Parsely/wp-parsely/compare/2.0...2.1) - 2020-06-05

- Update documentation.
- Extract logic for metadata construction and updating into their own methods.
- Add API Secret setting.
- Add bulk-updating of posts when posts are saved.
- Add 10-minute cron job schedule.
- Add Wipe Parsely Metadata Info setting.

## [2.0](https://github.com/Parsely/wp-parsely/compare/1.14...2.0) - 2019-04-29

- Change JavaScript integration to directly load tracker bundles that are customized for your specific site ID. See https://www.parse.ly/help/integration/basic/.
- NOTE: Sites that have custom Parse.ly video tracking configured (outside the Parse.ly WordPress plugin) for a player listed at https://www.parse.ly/help/integration/video_v2/#supported-players should contact support@parsely.com before upgrading.

## [1.14](https://github.com/Parsely/wp-parsely/compare/1.13.1...1.14) - 2019-01-15

- Update AMP analytics implementation.
- Add ability to use a horizontal layout of the widget (for page footers).
- Add `itm` campaign parameters to widget links for tracking performance.
- Add option to use original or resized thumbnail in the widget.
- Improves handling of missing taxonomy terms and other data.
- Improve post status check.
- Cleanup code to conform to WordPress VIP standards.

## [1.13.1](https://github.com/Parsely/wp-parsely/compare/1.13...1.13.1) - 2018-06-18

- Cleanup code to conform to WordPress VIP standards.

## [1.13](https://github.com/Parsely/wp-parsely/compare/1.12.5...1.13) - 2018-05-24

- Make AMP integration optional.
- Add support for publisher logo information.
- Fix minor bugs.

## [1.12.5](https://github.com/Parsely/wp-parsely/compare/1.12.4...1.12.5) - 2018-05-16

- Fix kissing close bracket for select tags on settings page.

## [1.12.4](https://github.com/Parsely/wp-parsely/compare/1.12.3...1.12.4) - 2018-05-15

- No net changes from 1.12.3

## [1.12.3](https://github.com/Parsely/wp-parsely/compare/1.12.2...1.12.3) - 2018-05-01

- Cleanup code to conform to WordPress VIP standards.

## [1.12.2](https://github.com/Parsely/wp-parsely/compare/1.12.1...1.12.2) - 2018-04-27

- Cleanup code to conform to WordPress VIP standards.
- Add security fixes.
- Add Author data when on author archive.
- Fix other linting issue
- Fix CSS bug for non-thumbnail widget.
- Remove broken or un-needed CSS rules.

## [1.12.1](https://github.com/Parsely/wp-parsely/compare/1.12...1.12.1) - 2018-01-30

- Fix archive pages having post canonicals.

## [1.12](https://github.com/Parsely/wp-parsely/compare/1.11.2...1.12) - 2018-01-26

- Add ability to use repeated meta tags instead of JSON-LD for metadata.
- Cleanup code to conform to WordPress VIP standards.
- Fix minor bugs.

## [1.11.2](https://github.com/Parsely/wp-parsely/compare/1.11...1.11.2) - 2017-12-19

- No net changes from 1.11.

## [1.11](https://github.com/Parsely/wp-parsely/compare/1.10.3...1.11) - 2017-12-18

- Add ability to use Parsely API with widget.
- Add ability to track or not track custom page and post types.
- Add ability to disable JavaScript tracking.
- Fix minor bugs.

## [1.10.3](https://github.com/Parsely/wp-parsely/compare/1.10.2...1.10.3) - 2017-09-21

- Update documentation.
- Amend logic for allowing logged users not to be tracked.

## [1.10.2](https://github.com/Parsely/wp-parsely/compare/v1.10.1...1.10.2) - 2016-10-25

- Validate `force_https_canonicals` value.
- Improve setting help text.
- Add security fix.

## [v1.10.1](https://github.com/Parsely/wp-parsely/compare/v1.10...v1.10.1) - 2016-09-22

- Update documentation.
- Add conditional in case there are no custom taxonomies.

## [v1.10](https://github.com/Parsely/wp-parsely/compare/v1.9...v1.10) - 2016-09-20

- Add ability to filter final JSON-LD output.
- Add the ability to use a custom taxonomy as tags.
- Add AMP / Facebook Instant integration with official AMP / FBIA plugins from Automattic.
- Fix bug related to HTTPS canonicals.

## [v1.9](https://github.com/Parsely/wp-parsely/compare/v1.8...v1.9) - 2016-06-23

- Add ability to assign custom taxonomies as section.
- Fix bug related to adding section to tag field.

## [v1.8](https://github.com/Parsely/wp-parsely/compare/v1.7...v1.8) - 2016-01-13

- Update documentation for installation and local development.
- Allow developers to adjust the tag list and the category reported for a post.
- Add support for themes to extend the reported authors.

## [v1.7](https://github.com/Parsely/wp-parsely/compare/v1.6...v1.7) - 2014-11-19

- Use JSON-LD / schema.org for parsely-page data instead of proprietary format.
- Add support for multiple authors if using the [Co-Authors Plus plugin](https://wordpress.org/plugins/co-authors-plus/).

## [v1.6](https://github.com/Parsely/wp-parsely/compare/v1.5...v1.6) - 2014-04-30

- Maintenance release with multiple changes needed for WordPress VIP inclusion.
- Migrate to WP Settings API.
- Various syntax changes in line with Automattic's guidelines.
- Remove the `tracker_implementation` option, plugin now uses Standard implementation for all installs.
- Update much of the copy in settings page.
- Update screenshots.

## [v1.5](https://github.com/Parsely/wp-parsely/compare/v1.4...v1.5) - 2013-06-17

- Add support for new option - "Use Categories as Tags".
- Fix bug that caused wp-admin bar to be hidden when "Do not track authenticated in users" was selected.
- Fix WP category logic bug that failed on users with custom post types.

## [v1.4](https://github.com/Parsely/wp-parsely/compare/v1.3...v1.4) - 2012-11-09

- Add early support for post tags.
- Fix permalink errors on category/author/tag pages.
- Add version output to both templates and settings pages.
- Rename API key to Site ID to avoid confusion.

## [v1.3](https://github.com/Parsely/wp-parsely/compare/v1.2...v1.3) - 2012-10-03

- Add option to not track or not track authenticated users (default is to not track authenticated users).
- Remove async implementation option.
- Update API key retrieval instructions.
- Add activation/deactivation hooks.
- null categories are now set to "Uncategorized".

## [v1.2](https://github.com/Parsely/wp-parsely/compare/v1.1...v1.2) - 2012-08-31

- Add support for using top-level categories for posts instead of the first active post the plugin finds.
- parsely-page meta tag now outputs its value using 'content' attribute instead of 'value'.
- Minor fixes to outputting to use proper WordPress functions.

## [v1.1](https://github.com/Parsely/wp-parsely/compare/v1.0...v1.1) - 2012-07-19

- Add ability to add a prefix to content IDs.
- Ensured the plugin only uses long tags `<?php` instead of `<?`.
- Security updates to prevent HTML/JavaScript injection attacks (values are now sanitized).
- Better error checking of values for API key / implementation method.
- Fix bugs.

## [v1.0](https://github.com/Parsely/wp-parsely/releases/tag/v1.0) - 2012-07-15

- Initial version.
- Add support for parsely-page and JavaScript on home page and published pages and posts as well as archive pages (date/author/category/tag).
