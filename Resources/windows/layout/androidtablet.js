/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 *
 * @fileOverview layout 'layout/androidtablet.js'.
 */

/** @private */
var Piwik = require('library/Piwik');

/**
 * @class    Piwik Mobile Android Tablet layout. Handles how header, menu and the content will be displayed. 
 *           How new windows will be removed or added and so on.
 *
 * @exports  layout as LayoutAndroid
 */
function layout () {

    /**
     * An array holding all current opened windows in detail view (right view). Each new created window will be pushed 
     * to this array. On the contrary we have to pop a window from this array as soon as we close/remove it.
     *
     * @type  Array
     */
    this.windows   = [];

    /**
     * An array holding all current opened windows in master view. Each new created window will be pushed to this array.
     * On the contrary we have to pop a window from this array as soon as we close/remove it.
     *
     * @type  Array
     */
    this.masterViewWindows = [];
    
    /**
     * zIndex counter. Will be increased by one for each new created window. This ensures a new created window will be
     * displayed in front of another window.
     *
     * @default  "0"
     *
     * @type     Number
     */
    this.zIndex    = 0;

    /**
     * A reference to the layout header.
     *
     * @default  null
     *
     * @type     Piwik.UI.Header
     */
    this.header    = null;

    /**
     * A reference to the layout menu.
     *
     * @default  null
     *
     * @type     Piwik.UI.Menu
     */
    this.menu      = null;

    /**
     * @private
     */
    var layout     = this;

    /**
     * @private
     */
    var rootWindow = Ti.UI.currentWindow;

    /**
     * @private
     */
    var masterViewHasContent = false;
    
    /**
     * Retrieve the current displayed window.
     *
     * @returns  {void|Piwik.UI.Window}  The current displayed window or void if no window is opened.
     * 
     * @private
     */
    this._getCurrentWindow = function (context) {

        if (this[context] && this[context].length) {

            return this.windows[this[context].length - 1];
        }
    };

    /**
     * Add a new window to the layout so that it will be visible afterwards. Does also add a property named
     * "rootWindow" to the newWin object which references to the root window (Ti.UI.Window) of the view.
     *
     * @param  {Piwik.UI.Window}  newWin  The window that shall be added to the layout.
     *                                    The window will be visible afterwards.
     */
    this.addWindow = function (newWin) {
        
        // wait till template and menuOptions are initialized, than fire focusWindow event.
        newWin.addEventListener('beforeOpen', function () {
            this.fireEvent('focusWindow', {});
        });
        
        newWin.rootWindow = rootWindow;

        if ('masterView' == newWin.target) {

            this._addWindowToMasterView(newWin);

        } else if ('detail' == newWin.target || 'modal' == newWin.target) {

            this._addWindowToDetailView(newWin);

        } else {

            this._replaceDetailView(newWin);
        }

        newWin = null;
    };
    
    /**
     * Adds a new window to the master view of the split window. The master view is the left view of the split window.
     *
     * @param  {Piwik.UI.Window}  newWin  The window that shall be added.
     * 
     * @private
     */
    this._addWindowToMasterView = function (newWin) {
        if (this.masterViewWindows && this.masterViewWindows.length) {

            this.masterViewWindows[this.windows.length - 1].close(true);
        }
        
        masterViewHasContent = true;
        
        this.initMenu();
        this.masterViewWindows.push(newWin);
        this.masterView.add(newWin);
        
        newWin = null;
    };
    
    /**
     * Adds a new window to the detail view of the split window. The detail view is the right view of the split window.
     *
     * @param  {Piwik.UI.Window}  newWin  The window that shall be added.
     * 
     * @private
     */
    this._addWindowToDetailView = function (newWin) {
        
        var currentWindow = this._getCurrentWindow('windows');
        if (currentWindow) {
            currentWindow.fireEvent('blurWindow', {});
            currentWindow = null;
        }
        
        Piwik.getUI().currentWindow = newWin;
        
        this.windows.push(newWin);
        this.detailView.add(newWin);
        
        newWin = null;
    };
    
    /**
     * Replaces the detail view of the split window. The detail view is the right view of the split window.
     * All currently opened windows within detail view will be closed/removed.
     *
     * @param  {Piwik.UI.Window}  newWin  The window that shall be replaced with the currently displayed.
     * 
     * @private
     */
    this._replaceDetailView = function (newWin) {
        
        var currentWindow = this._getCurrentWindow('windows');
        if (currentWindow) {
            currentWindow.fireEvent('blurWindow', {});
            
            if (1 < this.windows.length) {
                // @todo what if first screen is ReportsView cause only one site available?
                // do not replace websites overview
                currentWindow.close(true);
            }
        }
        
        Piwik.getUI().currentWindow = newWin;
        
        this.windows.push(newWin);
        this.detailView.add(newWin);
        
        newWin        = null;
        currentWindow = null;
    };

    /**
     * Remove a window from the layout so that it will be no longer visible. If no new window follows and the
     * window that shall be removed is the only displayed window, we'll not remove the window on iOS and we exit the
     * application on Android respectively in such a case.
     *
     * @param  {Piwik.UI.Window}  window               The window that shall be removed from the layout. The
     *                                                 current implementation requires that the given window,
     *                                                 which shall be removed, is the current displayed window.
     * @param  {boolean}          newWindowWillFollow  True if a new window will follow afterwards (via addWindow),
     *                                                 false otherwise. This is important cause it has an impact on
     *                                                 how to remove the window.
     */
    this.removeWindow = function (window, newWindowWillFollow) {
        if (!window) {
            return;
        }
        
        var isMasterWindow = false;
        // remove the window from stack
        if ('masterView' == window.target) {
            isMasterWindow = true;
            this.masterViewWindows.pop();
        } else {
            this.windows.pop();
        }

        if ((!this.windows || !this.windows.length)
            && !newWindowWillFollow
            && rootWindow) {
            // close window only on Android to exit the app. Closing the app is not allowed on iOS and we would end in a
            // blank window if we close the only opened window
            rootWindow.close();

            return;
        }
        
        try {
            
            if (isMasterWindow) {
                this.masterView.remove(window);
            } else {
                this.detailView.remove(window);
            }
            
          
        } catch (e) {
            Piwik.getLog().warn('Failed to remove window from root' + e, 'Android Layout');
        }
        
        window.rootWindow = null;
        window            = null;

        var newActiveWindow = this._getCurrentWindow(isMasterWindow ? 'masterViewWindows' : 'windows');

        if (!newActiveWindow) {

            return;
        }
        
        if (!isMasterWindow) {
            Piwik.getUI().currentWindow = null;
            Piwik.getUI().currentWindow = newActiveWindow;
        }
        
        newActiveWindow.fireEvent('focusWindow', {});

        // bring previous displayed window to front if no new window follows
        if (!newWindowWillFollow) {

            /**
             * we do not reset zIndex if a new window will follow cause zIndex is already correct
             * in such a case
             */
            this.zIndex = Piwik.getUI().currentWindow.zIndex;

            if (Piwik.getUI().currentWindow.focus) {
                // focus window so user can navigate via D-Pad within this view
                Piwik.getUI().currentWindow.focus();
            }
        }
        
        newActiveWindow = null;
    };

    this.shortenMenu = function () {

        var widthMasterViewSmall      = '198dp';
        this.masterViewSeparator.left = widthMasterViewSmall;
        
        this.masterView.left  = 0;
        this.masterView.width = widthMasterViewSmall;
        this.detailView.left  = '200dp';
    };
    
    this.enlargeMenu = function () {

        var widthMasterViewLarge      = '318dp';
        this.masterViewSeparator.left = widthMasterViewLarge;
        
        this.masterView.left  = 0;
        this.masterView.width = widthMasterViewLarge;
        this.detailView.left  = '320dp';
    };

    this.initMenu = function () {
        if (!masterViewHasContent) {
            
            return;
        }

        // 320dp masterView + 400dp detailView
        var isLarge = Piwik.getPlatform().pixelToDp(Ti.Platform.displayCaps.platformWidth) >= 720; 
        
        if (isLarge) {
            // landscape
            this.enlargeMenu();
        } else {
            // portrait
            this.shortenMenu();
        }
    }

    /**
     * Initialize the layout.
     *
     * Renders the basic layout like header and menu. This method should be executed only once during app session.
     */
    this.init = function () {

        this.header = Piwik.getUI().createHeader({title: 'Piwik Mobile'});
        
        this.masterViewSeparator = Ti.UI.createView({top: '48dp', bottom: 0, left: '-2dp', zIndex: 1001, width: '2dp', backgroundColor: '#8a8780'});
        rootWindow.add(this.masterViewSeparator);

        this.menu       = Piwik.getUI().createMenu({menuView: this.header.getHeaderView()});
        this.masterView = Ti.UI.createView({left: '-318dp', top: 0, bottom: 0, width: '318dp'});
        this.detailView = Ti.UI.createView({right: 0, top: 0, bottom: 0, left: '0dp'});
        
        Ti.Gesture.addEventListener('orientationchange', function () {
            layout.initMenu();
        });
        
        this.initMenu();
        
        rootWindow.add(this.detailView);
        rootWindow.add(this.masterView);
    };
}

module.exports = layout;