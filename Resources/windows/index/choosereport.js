/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'index/choosereport.js' .
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     Displays a list of all available websites where the user has at least view access. The user is able to
 *            select a website which opens a new window.
 *
 * @exports   window as WindowIndexChoosereport
 * @this      Piwik.UI.Window
 * @augments  Piwik.UI.Window
 */
function window () {

    /**
     * @see  Piwik.UI.Window#titleOptions
     * 
     * The last whitespace forces an redraw of the title on the iPad. Without this redraw the title will be aligned
     * right.
     */
    this.titleOptions = {title: 'Piwik Mobile '};
    
    /**
     * @see  Piwik.UI.Window#menuOptions
     */
    this.menuOptions  = {commands: [this.createCommand('OpenSettingsCommand')]};

    this.add(Ti.UI.createLabel({text: _('Mobile_ChooseReport'), className: 'choosereportInfo'}));

    this.open = function () {};
    
    this.cleanup = function () {};
}

module.exports = window;