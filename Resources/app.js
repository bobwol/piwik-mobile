/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$

 * @fileOverview File that will be executed on app start
 */
 
// set the background color of the master UIView
Ti.UI.setBackgroundColor('#ffffff');

var mainClass = 'mainwindow';

if (7 <= Ti.Platform.version) {
    mainClass = 'mainwindowIOS7';
}

var options = {url: 'bootstrap.js',
               exitOnClose:  true,
               softInputMode: Ti.UI.Android ? Ti.UI.Android.SOFT_INPUT_ADJUST_RESIZE : '',
               className: mainClass};

var win     = Ti.UI.createWindow(options);
options     = null;

win.open();
win = null;