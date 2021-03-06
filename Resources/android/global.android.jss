/*
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */
@import "android/header.android.jss";
@import "android/menu.android.jss";
@import "android/tableview.android.jss";
@import "android/graph.android.jss";
@import "android/statisticlist.android.jss";
@import "android/datepicker.android.jss";
@import "android/liveoverview.android.jss";
@import "android/visitoroverview.android.jss";
@import "android/visitor.android.jss";
@import "android/modalwindow.android.jss";

#activityWaitIndicator {
    height: '40dp';
    width: '40dp';
}

#loadingActivityIndicatorLabel {
    color: '#000000';
    zIndex: 999;
    font-weight: 'bold';
    font-size: '14sp';
    backgroundColor: '#ffffff';
}

.piwikWindow {
    backgroundColor: '#ffffff';
    top: '48dp';
}

/**
 * window index/index.js
 */
#websitesTableView
{
    separatorColor: '#eeedeb';
}

.websiteTableViewRow {

}

.searchHintLabel {
    font-size: 13;
    color: '#888888';
    width: 'size';
    left: '16dp';
    right: '16dp';
}

.searchHintTableViewRow {
}

#websiteSearchBar {
    showCancel: false;
    barColor: '#B2AEA5';
    height: '43dp';
    top: 0;
    autocorrect: false;
    autocapitalization: 0;
    focusable: false;
}

/**
 * window index/choosereport.js
 */
.choosereportInfo {
    color: '#bbbbbb';
    font-size: '24sp';
}

/**
 * window site/index.js
 */
#reportsTableView {
    zIndex: 2;
    separatorColor: '#eeedeb';
}

.reportTableViewRow {

}

/**
 * window graph/fulldetail.js
 */
.fullgraphImage {
    defaultImage: '/images/graphDefault.png';
}

/**
 * window help/faq.js
 */
#faqPageWebView {
    scalesPageToFit: false;
}

/**
 * window help/about.js
 */
#aboutPiwikView {
    layout: 'vertical';
}

.aboutPiwikLinkButton {
    focusable: true;
    top: '8dp';
    left: '16dp';
    right: '16dp';
    height: '45dp';
    backgroundImage: '/images/btn_default_normal_holo_light.9.png';
    backgroundFocusedImage: '/images/btn_default_focused_holo_light.9.png';
    backgroundSelectedImage: '/images/btn_default_focused_holo_light.9.png';
    backgroundDisabledImage: '/images/btn_default_disabled_holo_light.9.png';
}

#aboutPiwikLogo {
    image: '/images/logo_piwik_mobile.png';
    width: '288dp';
    height: '102dp';
    top: '16dp';
    bottom: '8dp';
}

/**
 * window help/feedback.js
 */
#giveFeedbackTableView {
    separatorColor: '#eeedeb';
}

/**
 * window settings/index.js
 */
#settingsTableView {
    separatorColor: '#eeedeb';
}

.settingsTableViewRowHasChild {
    hasChild: true;
}

.settingsTableViewRowHasDetail {
}

.settingsTableViewRowHasCheck{

}

.settingsTableViewRow {

}

/**
 * window settings/manageaccount.js
 */
#manageAccountsTableView {
    touchEnabled: false;
    separatorColor: '#eeedeb';
}

.manageAccountsRow {

    
}

/**
 * window settings/editaccount.js
 */
#editAccountScrollView {
    layout: 'vertical';
}

.editAccountTableFooterView {
    height: 'size';
    width: 'fill';
    left: 0;
}

#editAccountControlRow {
    /* 0 == Ti.UI.iPhone.TableViewCellSelectionStyle.NONE*/
    selectionStyle: 0;
    focusable: false;
}

.editAccountSaveButton {
    height: '45dp';
    left: '16dp';
    right: '16dp';
    focusable: true;
    top: '8dp';
    backgroundImage: '/images/btn_default_normal_holo_light.9.png';
    backgroundFocusedImage: '/images/btn_default_focused_holo_light.9.png';
    backgroundSelectedImage: '/images/btn_default_focused_holo_light.9.png';
    backgroundDisabledImage: '/images/btn_default_disabled_holo_light.9.png';
}

.editAccountTextField {
    focusable: true;
    color: '#333333';
    height: 'size';
    top: '8dp';
    bottom: '5dp';
    left: '16dp';
    right: '16dp';
    backgroundImage: '/images/textfield_default_holo_light.9.png';
    backgroundFocusedImage: '/images/textfield_activated_holo_light.9.png';
    backgroundDisabledImage: '/images/textfield_disabled_holo_light.9.png';
}

.editAccountSwitch {
    top: '8dp';
    bottom: '5dp';
    height: 'size';
    left: '16dp';
    focusable: true;
}

.editAccountNoPiwikAccountLabel {
    textAlign: 'center';
    color: '#333333';
    top: 20;
}

/**
 * window statistics/show.js
 */
#statisticsTableView {
    maxRowHeight: '300dp';
    separatorColor: '#eeedeb';
}

/**
 * window statistics/live.js
 */
#liveTableView {
    separatorColor: '#eeedeb';
    bottom: '20dp';
}

.countdownView {
    height: '20dp';
    bottom: '0dp';
    opacity: 0.8;
    backgroundColor: '#333333';
}

.countdownLabel {
    fontSize: '14dp';
    color: 'white';
}

/**
 * window statistics/visitorlog.js
 */
#visitorLogTableView {
    separatorColor: '#eeedeb';
}

.visitorlogPagerTableViewRow {
    color: '#336699';
    left: '16dp';
}
