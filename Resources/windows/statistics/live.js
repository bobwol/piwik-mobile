/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'statistics/live.js' .
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     Displays an overview of visitors in real time. It currently displays the latest 10 visitors on window 
 *            open. If auto refresh is enabled, it will automatically request new visitors. The list does not display 
 *            more than 30 visitors cause of performance/memory impacts (especially on older/slower devices).
 *
 * @param     {Object}   params
 * @param     {Object}   params.site         The current selected site.
 * @param     {boolean}  params.autoRefresh  True if the window shall refresh the visitors in real time.
 *
 * @exports   window as WindowStatisticsLive
 * @this      Piwik.UI.Window
 * @augments  Piwik.UI.Window
 */
function window (params) {

    /**
     * @see  Piwik.UI.Window#titleOptions
     */
    this.titleOptions = {title: _('Live_VisitorsInRealTime')};

    /**
     * @see  Piwik.UI.Window#menuOptions
     */
    this.menuOptions  = {commands: [this.createCommand('RefreshCommand')]};
    
    if (this.rootWindow) {
        this.rootWindow.backButtonTitle = _('General_Reports');
    }

    this.refreshTimer = null;
    
    var that                     = this;
    var refreshIntervalInMs      = 45000;
    var latestRequestedTimestamp = 0;

    var request   = Piwik.require('Network/LiveRequest');
    var tableView = this.create('TableView', {id: 'liveTableView'});
    var refresh   = this.create('Refresh', {tableView: tableView});

    this.add(tableView.get());
    
    var countdownView  = Ti.UI.createView({className: 'countdownView'});
    var countdownLabel = Ti.UI.createLabel({text: '-', className: 'countdownLabel'});
    countdownView.add(countdownLabel);
    
    this.add(countdownView);
    countdownView = null;

    var interval  = null;
    var stopRefreshTimer = function () {

        if (that && that.refreshTimer) {
            // do no longer execute autoRefresh if user opens another app or returns the home screen (only for iOS)
            clearTimeout(that.refreshTimer);
        }
        
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        
        if (countdownLabel) {
            countdownLabel.text = '-';
        }
    };

    var startRefreshTimer = function (timeoutInMs) {
        
        if (!interval) {
            
            interval = setInterval(function () {
                
                if (!countdownLabel) {
                    
                    return;
                }
                
                if (0 == countdownLabel.text || '-' == countdownLabel.text) {
                    // a refresh should occur
                    return;
                }
                
                countdownLabel.text = countdownLabel.text - 1;

            }, 1000);
        }
        
        if (countdownLabel) {
            countdownLabel.text = '' + parseInt(timeoutInMs/1000);
        }
        
        that.refreshTimer = setTimeout(function () {
            if (refresh) {
                refresh.refresh();
            }
        }, timeoutInMs);
    }

    var site = params.site;

    if (!site || !site.accountId) {
        //@todo shall we close the window?
        Piwik.getLog().warn('Missing site parameter, can not display window', 'statistics/live::window');

        return;
    }
    
    var accountManager   = Piwik.require('App/Accounts');
    var account          = accountManager.getAccountById(site.accountId);

    if (!account) {
        //@todo shall we close the window?
        Piwik.getLog().warn('Account not exists, can not display window', 'statistics/live::window');

        return;
    }

    var accessUrl      = Piwik.getNetwork().getBasePath('' + account.accessUrl);

    /**
     * Holds a list of the last 30 visitors across multiple requests. We'll render only visitors which are defined
     * in this array.
     *
     * Array (
     *    [int] => [Object Visitor]
     * )
     *
     * @type  Array
     * @private
     */
    var visitors    = [];
    var visitorRows = [];
    
    this.addEventListener('onSiteChanged', function (event) {
        // user has changed the site

        Piwik.getTracker().trackEvent({title: 'Site changed', url: '/statistic-change/site'});

        params.site = event.site;
        site        = event.site;
        account     = accountManager.getAccountById(event.site.accountId);
        latestRequestedTimestamp = 0;
        
        if (!account) {
            
            return;
        }
        
        // quick fix to force redraw of websiteRow if selected website has no visitors
        that.lastMinutes = null;
        that.lastHours   = null;
        visitors         = [];
        
        accessUrl = Piwik.getNetwork().getBasePath('' + account.accessUrl);

        if (refresh) {
            refresh.refresh();
        }
        
        event = null;
    });

    this.addEventListener('closeWindow', function () {
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
    });

    this.addEventListener('blurWindow', function () {
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
    });

    this.addEventListener('focusWindow', function () {
        if (params && params.autoRefresh && tableView && tableView.data && tableView.data.length && that) {
            // start auto refresh again if user returns to this window from a previous displayed window
            
            startRefreshTimer(20000);
        }
    });
    
    var onResume = function () {
        if (params && params.autoRefresh && tableView && tableView.data && tableView.data.length && that) {
            
            if (stopRefreshTimer) {
                stopRefreshTimer();
            }
            
            // start auto refresh again if user returns to this window from a previous displayed window
            startRefreshTimer(3000);
        }
    };
    
    var onPause = function () {
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
    }
    
    // ios
    Ti.App.addEventListener('resume', onResume);
    Ti.App.addEventListener('pause', onPause);

    var activity = null;
    
    // get activity on android
    if (Ti.Android && Ti.Android.currentActivity) {
        activity = Ti.Android.currentActivity;
    } else if (!activity && Ti.UI.currentWindow && Ti.UI.currentWindow.activity) {
        activity = Ti.UI.currentWindow.activity;
    } else if (!activity && this.rootWindow && this.rootWindow.activity) {
        activity = this.rootWindow.activity;
    }
    // android
    if (activity) {
        activity.addEventListener('pause', stopRefreshTimer);
        activity.addEventListener('stop', stopRefreshTimer);
    }
    
    refresh.addEventListener('onRefresh', function () {
        // user possibly requested refresh manually. Stop a previous timer. Makes sure we won't send the same
        // request in a few seconds again
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
                
        // set the latest requested timestamp to make sure we don't fetch the same users again which are already
        // displayed
        if (latestRequestedTimestamp) {
            params.minTimestamp = latestRequestedTimestamp;
        }
        
        params.fetchLiveOverview = true;

        request.send(params);
    });

    tableView.addEventListener('click', function (event) {

        if (!event || !event.row || !event.row.visitor || !that) {

            return;
        }

        // open a new window to displayed detailed information about the visitor
        that.create('Visitor', {accessUrl: accessUrl,
                                visitor: event.row.visitor,
                                openView: event.row.popoverView});

        event = null;
    });
    
    var siteCommand = this.createCommand('ChooseSiteCommand');

    request.addEventListener('onload', function (event) {

        if (refresh) {
            refresh.refreshDone();
        }
        
        if (!tableView || !tableView.setData || !that) {
            
            return;
        }
        
        if (!event.details || !event.details.length) {

            if (!that.lastMinutes || !that.lastHours) {
                // @todo test me 
               
                // clear previous displayed data
                tableView.reset();
        
                // make sure at least live overview will be rendered
                that.lastMinutes = that.create('LiveOverview', {title: String.format(_('Live_LastMinutes'), '30')});
                that.lastHours   = that.create('LiveOverview', {title: String.format(_('Live_LastHours'), '24')});
                        
                var websiteRow   = that.create('TableViewRow', {title: site ? site.name : '', 
                                                                hasChild: true, 
                                                                className: 'tableViewRowSelectable',
                                                                command: siteCommand});

                tableView.setData([websiteRow, that.lastMinutes.getRow(), that.lastHours.getRow()]);
            }

            if (event.lastMinutes) {
                that.lastMinutes.refresh({actions: event.lastMinutes.actions,
                                          visits: event.lastMinutes.visits});
            }

            if (event.lastHours) {
                that.lastHours.refresh({actions: event.lastHours.actions,
                                        visits: event.lastHours.visits});
            }
            
            if (params && params.autoRefresh) {
                if (stopRefreshTimer) {
                    stopRefreshTimer();
                }

                startRefreshTimer(refreshIntervalInMs);
            }

            return;
        }

        // clear previous displayed data
        if (tableView) {
            tableView.reset();
        }

        that.lastMinutes = that.create('LiveOverview', {title: String.format(_('Live_LastMinutes'), '30')});
        that.lastHours   = that.create('LiveOverview', {title: String.format(_('Live_LastHours'), '24')});
        
        var websiteRow   = that.create('TableViewRow', {title: site ? site.name : '', 
                                                        hasChild: true, 
                                                        className: 'tableViewRowSelectable',
                                                        command: siteCommand});

        /**
         * Holds all rows that shall be rendered
         *
         * @type  Array
         * @private
         */
         visitorRows  = [websiteRow,
                         that.lastMinutes.getRow(),
                         that.lastHours.getRow(),
                         that.create('TableViewSection', {title: _('General_Visitors')})];
         websiteRow   = null;

        if (event.lastMinutes && that) {
            that.lastMinutes.refresh({actions: event.lastMinutes.actions, visits: event.lastMinutes.visits});
        }

        if (event.lastHours && that) {
            that.lastHours.refresh({actions: event.lastHours.actions, visits: event.lastHours.visits});
        }

        // prepend each new visitor to visitors list. Recent visitors have a lower index afterwards, older visitors
        // have a higher index. This makes sure we can simply remove older visitors later.
        var visitor = null;

        for (var index = event.details.length; 0 <= index; index--) {

            visitor = event.details[index];

            if (!visitor) {
                continue;
            }

            visitors.unshift(visitor);
        }

        if (visitor && visitor.serverTimestamp) {
            // store the timestamp of the first visitor as the latest requested timestamp
            latestRequestedTimestamp = visitor.serverTimestamp;
        }

        // remove all old visitors / render only the latest 30 visitors. otherwise there are possibly
        // memory/scrolling issues
        visitors = visitors.slice(0, 30);
        
        if (!that) {

            return;
        }

        // now render all rows. We have to re-render even already rendered visitors. There seems to be a bug in
        // Titanium. If I set an already rendered Row via setData() again, the row will be rendered twice (only on iOS).
        // If I set it again the same row will be rendered thrice instead of only once. That means previous rendered
        // rows will not be removed via "setData". It does only append the new rows but not remove already rendered
        // TableViewRows as soon as a reuse an already rendered row.
        var visitorOverview = null;
        var visitorRow      = null;
        for (var index = 0; index < visitors.length; index++) {
            visitor = visitors[index];

            visitorOverview    = that.create('VisitorOverview', {visitor: visitor, accessUrl: accessUrl});
            visitorRow         = visitorOverview.getRow();

            // add visitor information to the row. This makes it possible to access this value when
            // the user clicks on a row within the tableview (click event).
            // we do not do this in VisitorOverview UI widget cause it's a window specific thing.
            visitorRow.visitor = visitor;

            visitorRows.push(visitorRow);
            
            visitorRow         = null;
            visitorOverview    = null;
        }

        tableView.setData(visitorRows);
        visitorRows = null;

        if (params && params.autoRefresh && that) {
            if (stopRefreshTimer) {
                stopRefreshTimer();
            }

            startRefreshTimer(refreshIntervalInMs);
        }
        
        event = null;
    });

    /**
     * Request real time visitors async.
     *
     * @param  {object}  params
     */
    this.open = function (params) {
        params.fetchLiveOverview = true;
        request.send(params);
        params = null;
    };
    
    this.cleanup = function () {
        
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
        
        if (tableView && tableView.get()) {
            this.remove(tableView.get());
        }
        
        if (request) {
            request.cleanup();
        }
        
        try {
            // android, prevent memory leaks
            if (activity && stopRefreshTimer) {
                activity.removeEventListener('pause', stopRefreshTimer);
                activity.removeEventListener('stop', stopRefreshTimer);
            }

            // ios, prevent memory leaks
            Ti.App.removeEventListener('resume', onResume);
            Ti.App.removeEventListener('pause', onPause);
            onResume = null;
            onPause = null;

        } catch (e) {
            Piwik.getLog().warn('Failed to remove event listener from activity' + e, 'statistics/live::window');
        }

        visitorRows    = null;
        tableView      = null;
        request        = null;
        refresh        = null;
        that           = null;
        visitors       = null;
        accountManager = null;
        account        = null;
        site           = null;
        params         = null;
        activity       = null;
        countdownLabel    = null;
        stopRefreshTimer  = null;
        this.lastMinutes  = null;
        this.lastHours    = null;
        this.refreshTimer = null;
        this.menuOptions  = null;
        this.titleOptions = null;
    };
}

module.exports = window;