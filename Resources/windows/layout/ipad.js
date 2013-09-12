/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 *
 * @fileOverview layout 'layout/ipad.js' .
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

var statusBarStyle = Titanium.UI.iPhone.StatusBar.TRANSLUCENT_BLACK;

/**
 * @class    iPad specific Piwik Mobile layout. Handles how header, menu and the content will be displayed. 
 *           How new windows will be removed or added and so on.
 * 
 * @exports  layout as LayoutIpad
 */
function layout () {

    /**
     * An array holding all current opened windows within the detail view. Each new created window will be pushed to 
     * this array. On the contrary we have to pop a window from this array as soon as we close/remove it.
     *
     * @type  Array
     */
    this.windows  = [];
    
    /**
     * An array holding all current opened modal windows. Each new created modal window will be pushed to this array.
     * On the contrary we have to pop a window from this array as soon as we close/remove it.
     *
     * @type  Array
     */
    this._modalWindows  = [];

    /**
     * A reference to the piwik window in master view.
     *
     * @default  null
     *
     * @type     Piwik.UI.Window
     */
    this._masterWindow = null;
    
    /**
     * zIndex counter. Will be increased by one for each new created window. This ensures a new created window will be
     * displayed in front of another window.
     *
     * @default  "0"
     *
     * @type     Number
     */
    this.zIndex   = 0;

    /**
     * A reference to the layout header.
     *
     * @default  null
     *
     * @type     Piwik.UI.Header
     */
    this.header   = null;

    /**
     * A reference to the layout menu.
     *
     * @default  null
     *
     * @type     Piwik.UI.Menu
     */
    this.menu     = null;

    /**
     * An instance of the master window which is displayed within the split window - master view.
     *
     * @default  null
     *
     * @type     null|Ti.UI.Window
     * 
     * @private
     */
    this._masterWin = null;

    /**
     * An instance of the modal window. Is only set if at least one modal window is currently displayed.
     *
     * @default  null
     *
     * @type     null|Ti.UI.Window
     * 
     * @private
     */
    this._modalWindow = null;

    /**
     * An instance of the modal navigation group. Is only set if at least one modal window is currently displayed.
     *
     * @default  null
     *
     * @type     null|Ti.UI.iPhone.NavigationGroup
     * 
     * @private
     */
    this._modalNav = null;

    /**
     * An instance of the detail navigation group. 
     *
     * @default  null
     *
     * @type     null|Ti.UI.iPhone.NavigationGroup
     * 
     * @private
     */
    this._detailNav = null;

    /**
     * @private
     */
    var layout    = this;
    
    /**
     * Retrieve the current displayed window.
     *
     * @returns  {void|Piwik.UI.Window}  The current displayed window or void if no window is opened.
     * 
     * @private
     */
    this._getCurrentWindow = function () {

        return Piwik.getUI().currentWindow;
    };
    
    /**
     * Adds a new window to the master view of the split window. The master view is the left view of the split window.
     *
     * @param  {Piwik.UI.Window}  newWin  The window that shall be added.
     * 
     * @private
     */
    this._addWindowToMasterView = function (newWin) {
        if (!newWin) {
            return;
        }
        
        try {
            if (this._masterWindow) {
                this._masterWindow.fireEvent('blurWindow', {});
                this._masterWindow.close(true);
                this._masterWindow.rootWindow = null;
                this._masterWindow = null;
            }
        } catch (e) {
            Piwik.getLog().warn('Failed to close current window: ' + e, 'iPadLayout::_addWindowToMasterView');
        }

        newWin.rootWindow = this._masterWin;
        this._masterWin.add(newWin);
        this._masterWindow = newWin;
        
        newWin.fireEvent('focusWindow', {});
        
        newWin = null;
    };
        
    /**
     * Creates the modal root window. Creates the window only if it already exists.
     * 
     * @private
     */
    this._createModalRootWindow = function () {
        if (layout._modalWindow) {
            
            return;
        }
         
        layout._modalWindow = Ti.UI.createWindow({navBarHidden: true, barColor: '#B2AEA5', navTintColor: '#333333'});
        
        layout._modalWindow.open({
            modal:true,
            modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL,
            modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
        });
    };
        
    /**
     * Displays the newWin within a modal window. If no modal window exists, it creates one.
     * 
     * @param  {Piwik.UI.Window}  newWin  The window that shall be added.
     * 
     * @private
     */
    this._addWindowToModal = function (newWin) {

        this._createModalRootWindow();

        var modalWin = Ti.UI.createWindow({barColor: '#B2AEA5', navTintColor: '#333333', statusBarStyle: statusBarStyle});
        modalWin.add(newWin);
        
        newWin.rootWindow = modalWin;
        
        if (!layout._modalNav) {
            // create modal navigation group
            var doneButton = Ti.UI.createButton({title: _('General_Close'),
                                                 style: Ti.UI.iPhone.SystemButtonStyle.CANCEL});
                     
            doneButton.addEventListener('click', function () {
    
                try {
                    modalWin.close();
                    layout._modalWindow.close();
                    layout._modalWindow = null;
                    modalWin            = null;
                    layout._modalNav    = null;
                } catch (e) {
                    Piwik.getLog().warn('Failed to close site chooser window', 'Piwik.UI.Menu::onChooseSite');
                }
            });
            
            modalWin.leftNavButton = doneButton;
                            
            layout._modalNav       = Ti.UI.iPhone.createNavigationGroup({
               window: modalWin
            });
            
            layout._modalWindow.add(layout._modalNav);
            
        } else {
            // modalNav does already exist, just display the new window within the modalNav.
            layout._modalNav.open(modalWin);
        }
        
        this._modalWindows.push(newWin);
        
        modalWin.addEventListener('close', function () {
            // window was closed via navigation group
            if (this.url) {
                // this == newWin
                
                return;
            }
            // this == modalWin
            newWin.close();
        });
        
        newWin.addEventListener('close', function () {
            // if newWin closes, do also remove the window from the modal navigation.
            if (layout && layout._modalNav && this && this.rootWindow) {
                try {
                    layout._modalNav.close(this.rootWindow);
                } catch (e) {
                    Piwik.getLog().warn('Failed to remove rootWin from Navigation', 'iPadLayout::_addWindowToModal');
                }
            }
        });

        newWin.fireEvent('focusWindow', {type: 'focusWindow'});
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
        
        while (this.windows.length) {
            // remove possible existing detail windows
            try {
                var currentWindow = this.windows[this.windows.length - 1];
                currentWindow.fireEvent('blurWindow', {});
                currentWindow.close();
                currentWindow = null;
            } catch (e) {
                Piwik.getLog().warn('Failed to close current window: ' + e, 'iPadLayout::addWindowToDetailView');
            }
        }

        newWin.fireEvent('focusWindow', {});

        Piwik.getUI().currentWindow = newWin;

        this.windows.push(newWin);

        newWin.rootWindow = Ti.UI.currentWindow;
        
        Ti.UI.currentWindow.add(newWin);
        
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
        
        var params = {barColor: '#B2AEA5', navTintColor: '#333333'};
 
        var detailWindow  = Ti.UI.createWindow(params);
        newWin.target     = 'detail';
        newWin.rootWindow = detailWindow;
        
        newWin.fireEvent('focusWindow', {});

        Piwik.getUI().currentWindow = newWin;
        
        this.windows.push(newWin);
        
        detailWindow.add(newWin);
        
        this._detailNav.open(detailWindow);

        detailWindow.addEventListener('close', function () {
            // window was closed via navigation group
            if (this.url || !newWin) {
                // this == newWin
                
                return;
            }
            // this == detailWin
            newWin.close();
        });
        
        newWin.addEventListener('closeWindow', function () {
            // if newWin closes, do also remove the window from detail navigation.
            if (layout && layout._detailNav && this && this.rootWindow) {
                try {
                    layout._detailNav.close(this.rootWindow);
                } catch (e) {
                    Piwik.getLog().warn('Failed to remove rootWin from Navigation', 'iPadLayout::_addWindowToDetailSubView');
                }
            }
        });
    };
    
    /**
     * Add a new window to the layout so that it will be visible afterwards. Does also add a property named
     * "rootWindow" to the newWin object which references to the root window (Ti.UI.Window) of the view.
     *
     * @param  {Piwik.UI.Window}  newWin           The window that shall be added to the layout.
     *                                             The window will be visible afterwards.
     * @param  {string}           [newWin.target]  Either 'masterView', 'modal' or 'detailView'.
     */
    this.addWindow = function (newWin) {

        if (newWin && newWin.target && 'masterView' == newWin.target) {

            this._addWindowToMasterView(newWin);
            newWin = null;
            
            return;
            
        } else if (newWin && newWin.target && 'modal' == newWin.target) {
            
            this._addWindowToModal(newWin);
            newWin = null;
            
            return;
        } else if (newWin && newWin.target && 'detail' == newWin.target) {
            
            this._addWindowToDetailView(newWin);
            newWin = null;
            
            return;
        }

        this._replaceDetailView(newWin);
        newWin = null;
    };

    /**
     * Remove a window from the layout so that it will be no longer visible.
     *
     * @param  {Piwik.UI.Window}  piwikWindow          The window that shall be removed from the layout. The
     *                                                 current implementation requires that the given window,
     *                                                 which shall be removed, is the current displayed window.
     * @param  {boolean}          newWindowWillFollow  True if a new window will follow afterwards (via addWindow),
     *                                                 false otherwise. 
     */
    this.removeWindow = function (piwikWindow, newWindowWillFollow) {

        try {
            
            if (!piwikWindow || !piwikWindow.rootWindow) {
                Piwik.getLog().warn('No window or rootWindow given', 'iPadLayout::removeWindow');
                
                return;
            }

            if (Ti.UI.currentWindow === piwikWindow.rootWindow) {
                
                this.windows.pop();
                
            } else if ('modal' == piwikWindow.target && this._modalWindows && this._modalWindows.length) {
                this._modalWindows.pop();
                
                // focus previous window. makes sure they can set their navigation buttons and so on
                if (this._modalWindows.length && this._modalWindows[this._modalWindows.length - 1]) {
                    this._modalWindows[this._modalWindows.length - 1].fireEvent('focusWindow', {type: 'focusWindow'});
                }
            } else if ('detail' == piwikWindow.target && this.windows && this.windows.length) {
                this.windows.pop();
            } 

            // remove window from main window so that it will be no longer visible
            piwikWindow.rootWindow.remove(piwikWindow);
            
        } catch (e) {
            Piwik.getLog().warn('Failed to remove PiwikWin from rootWindow: ' + e, 'iPadLayout::removeWindow');
        }

        piwikWindow = null;
    };
    
    this.setMenu = function (window, menu) {
        if (!window || !menu) {
            
            return;
        }
        
        menu.window = window;
        this.menu.refresh(menu);
        
        window = null;
        menu   = null;
    };
    
    this.setHeader = function (window, header) {
        if (!window || !header) {
            
            return;
        }
        
        header.window = window;
        this.header.refresh(header);
        
        window = null;
        header = null;
    };

    /**
     * Initialize the layout.
     *
     * Renders the basic layout like header and menu. This method should be executed only once during app session.
     */
    this.init = function () {

        var masterWinOptions = {title: _('General_Reports'), barColor: '#B2AEA5', navTintColor: '#ffffff', statusBarStyle: statusBarStyle};
        
        this._masterWin    = Ti.UI.createWindow(masterWinOptions);

        var settingsButton = Ti.UI.createButton({image: 'images/ic_action_settings.png', width: 37});

        settingsButton.addEventListener('click', function () {
            Piwik.getUI().createWindow({url: 'settings/index', target: 'modal'});
        });
        
        this._masterWin.leftNavButton = settingsButton;
        settingsButton                = null;

        this._detailNav = Ti.UI.iPhone.createNavigationGroup({
            window: Ti.UI.currentWindow
        });
        
        this.header     = Piwik.getUI().createHeader({title: 'Piwik Mobile'});
        this.menu       = Piwik.getUI().createMenu({menuView: this.header.getHeaderView()});
        
        var navMaster   = Ti.UI.iPhone.createNavigationGroup({
            window: this._masterWin
        });

        var splitwin    = Titanium.UI.iPad.createSplitWindow({
            detailView: this._detailNav,
            masterView: navMaster,
            showMasterInPortrait: true
        });

        splitwin.open();
    };
}

module.exports = layout;