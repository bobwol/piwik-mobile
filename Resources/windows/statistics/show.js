/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'statistics/show.js' .
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     Display statistics depending on the given site and period. The user is able to change period, date and 
 *            site.
 *
 * @param     {Object}       params
 * @param     {Object}       params.site       The current selected site.
 * @param     {Object}       params.report     Report information. Object looks like:
 *                                             {"category":"Actions",
 *                                              "name":"Downloads",
 *                                              "module":"Actions",
 *                                              "action":"getDownloads",
 *                                              "dimension":"Download URL",
 *                                              "metrics":{"nb_hits":"Pageviews","nb_visits":"Visits"},
 *                                              "uniqueId":"Actions_getDownloads"},
 * @param     {string|Date}  [params.date]     Optional. The current selected date. Can be either a Date object
 *                                             or string in the following format "YYYY-MM-DD". Defaults to now.
 * @param     {string}       [params.period]   Optional. The current selected period. For example 'day' or 'week'.
 * @param     {string}       [params.metric]   Optional. The current selected metric. For example 'nb_visits'.
 * @param     {boolean}      [params.showAll]  Optional. True if all (is slow), false if only the top most (paging)
 *                                             statistics shall be fetched.
 * @param     {string|}      [params.backButtonTitle]     An optional back button title. Only for iOS.
 *
 * @exports   window as WindowStatisticsShow
 * @this      Piwik.UI.Window
 * @augments  Piwik.UI.Window
 */
function window (params) {

    /**
     * @see  Piwik.UI.Window#titleOptions
     */
    this.titleOptions = {title: params.report ? params.report.name : ''};

    /**
     * @see  Piwik.UI.Window#menuOptions
     */
    this.menuOptions  = {};
    
    if (this.rootWindow) {
        this.rootWindow.backButtonTitle = params.backButtonTitle ? params.backButtonTitle : _('General_Reports');
    }
    
    var that          = this;
    var tableViewRows = [];

    if (params.report) {
        Piwik.getTracker().setCustomVariable(1, 'reportModule', params.report.module, 'page');
        Piwik.getTracker().setCustomVariable(2, 'reportAction', params.report.action, 'page');
        Piwik.getTracker().setCustomVariable(3, 'reportUniqueId', params.report.uniqueId, 'page');
    }

    var request   = Piwik.require('Network/StatisticsRequest');
    var tableView = this.create('TableView', {id: 'statisticsTableView'});
    var refresh   = this.create('Refresh', {tableView: tableView});

    this.add(tableView.get());

    this.addEventListener('onDateChanged', function (event) {
        // user has changed the date and/or period -> reload statistics using the updated date/period

        var period = '';
        if (event && event.period) {
            period        = event.period;
            params.period = period;
        }

        Piwik.getTracker().trackEvent({title: 'Date/Period changed', 
                                       url: '/statistic-change/date-period/' + period});

        if (event && event.date) {
            params.date = event.date;
        }

        params.showAll = false;

        refresh.refresh();
    });

    this.addEventListener('onSiteChanged', function (event) {
        // user has changed the site -> load statistics of the new site

        Piwik.getTracker().trackEvent({title: 'Site changed', url: '/statistic-change/site'});

        params.site    = event.site;
        params.showAll = false;

        refresh.refresh();
    });

    this.addEventListener('onMetricChanged', function (event) {
        // user has changed the site -> load statistics of the new site

        Piwik.getTracker().trackEvent({title: 'Metric changed', url: '/statistic-change/metric'});

        params.metric  = event.metric;
        params.showAll = false;

        refresh.refresh();
    });

    this.addEventListener('onPaginatorChanged', function (event) {

        if (event.showAll) {
            Piwik.getTracker().trackEvent({title: 'Show all changed', url: '/statistic-change/show-all/enabled'});
        } else {
            Piwik.getTracker().trackEvent({title: 'Show all changed', url: '/statistic-change/show-all/disabled'});
        }

        params.showAll = event.showAll;

        refresh.refresh();
    });

    refresh.addEventListener('onRefresh', function () {
        // simple refresh using the same params
        if (tableView) {
            tableView.reset();
        }

        if (request) {
            request.send(params);
        }
    });

    var refreshCommand = this.createCommand('RefreshCommand');
    request.addEventListener('onload', function (event) {

        if (!event || !that || !tableView) {
            return;
        }
        
        var site = event.site;
        
        var metrics = {};
        if (event.columns) {
            metrics = event.columns;
        }

        that.menuOptions  = {commands: [refreshCommand], window: that};

        // update menu after each request cause of a possibly period and/or date change.
        Piwik.getUI().layout.menu.refresh(that.menuOptions);

        tableViewRows = [];

        if (!event || !event.metadata || !event.metadata.isSubtableReport) {
            // only display site command if it is not a subtable report
            // a website selector makes no sense here cause the same subtable won't exist for another website
            var siteCommand = that.createCommand('ChooseSiteCommand');
            tableViewRows.push(that.create('TableViewRow', {title: site ? site.name : '', 
                                                            hasChild: true, 
                                                            className: 'tableViewRowSelectable',
                                                            command: siteCommand}));
        }

        var graph    = null;
        var graphUi  = null;
        var graphUrl = null;

        if (event.graphsEnabled && event.metadata && event.metadata.imageGraphUrl && that) {

            graph              = Piwik.require('PiwikGraph');
            var accountManager = Piwik.require('App/Accounts');
            var account        = accountManager.getAccountById(event.site.accountId);
            accountManager     = null;
            graphUrl           = event.metadata.imageGraphUrl;
            
            if (Piwik.require('App/Settings').getPreferEvoltuionGraphs() && event.metadata.imageGraphEvolutionUrl) {
                graphUrl = event.metadata.imageGraphEvolutionUrl;
            }
            
            if (event.sortOrderColumn) {
                graphUrl = graph.setParams(graphUrl, {filter_sort_column: event.sortOrderColumn, 
                                                      column: event.sortOrderColumn,    // column = Piwik 1.8 and older
                                                      columns: event.sortOrderColumn}); // columns = Piwik 1.9 and newer
            }
            
            graphUrl = graph.generateUrl(graphUrl, account, event.site, event.report);
            graphUi  = that.create('Graph', {graphUrl: graphUrl, 
                                             reportName: event.metadata.name ? event.metadata.name : '', 
                                             reportDate: event.reportDate ? event.reportDate : ''});
            account  = null;
            
            if (graphUi) {
                tableViewRows.push(graphUi.getRow());
            }
            
            graph   = null;
            graphUi = null;
        }
        
        var hasDimension = false;
        if (event.report && event.report.dimension) {
            hasDimension = true;
        } else if (event.columns && event.columns.label) {
            hasDimension = true;
        }

        var statsticValueLabel = '';
        if (event.columns && event.columns[event.sortOrderColumn]) {
            statsticValueLabel = event.columns[event.sortOrderColumn];
        } else if (event.columns && event.columns.value) {
            statsticValueLabel = event.columns.value;
        }

        if ((graphUrl || hasDimension) && statsticValueLabel) {
            // Display metric only where it makes sence. It generally makes sence for all reports having a dimension.
            // For example 'VisitsSummary.get' is a report having no dimension.
            // It makes also sence to display metric if a graph is displayed. The changed metric will not effect the
            // displayed statistics but the graph (mostly evolution graphs)
        
            var metricCommand = that.createCommand('ChooseMetricCommand', {metrics: metrics});
            var headlineRow   = that.create('TableViewRow', {title: statsticValueLabel,
                                                             command:  metricCommand,
                                                             className: 'tableViewRowSelectable',
                                                             hasChild: true});
            tableViewRows.push(headlineRow);
            headlineRow   = null;
            metricCommand = null;
        }

        var dateCommand = that.createCommand('ChooseDateCommand', {date: event.date, period: event.period});
        tableViewRows.push(that.create('TableViewRow', {title:  event.reportDate, 
                                                        hasChild: true,
                                                        className: 'tableViewRowSelectable',
                                                        command: dateCommand}));

        var visitorStats  = that.create('StatisticList', {values:   event.reportData,
                                                          showAll:  event.showAll});

        tableViewRows     = tableViewRows.concat(visitorStats.getRows());
        visitorStats      = null;

        refresh.refreshDone();
        tableView.setData(tableViewRows);
        
        dateCommand   = null;
        siteCommand   = null;
        event         = null;
        metrics       = null;
    });

    if (params && params.report && params.report.actionToLoadSubTables) {
        
        var actionToLoadSubTables = params.report.actionToLoadSubTables;
        
        tableView.addEventListener('click', function (event) {

            if (!event || !event.row || !event.row.idSubtable) {
                
                return;
            }
            
            var backTitle = (params.report && params.report.name) ? params.report.name : _('Mobile_NavigationBack');

            // make a simple copy of params
            var newParams               = JSON.parse(JSON.stringify(params));
            newParams.report.action     = actionToLoadSubTables;
            newParams.report.idSubtable = event.row.idSubtable;
            newParams.report.name       = event.row.reportName;
            newParams.url               = 'statistics/show';
            newParams.backButtonTitle   = backTitle;
            newParams.target            = 'detail';
            
            that.create('Window', newParams);
        });
    }
    
    /**
     * Request statistics async.
     *
     * @param  {object}  params 
     */
    this.open = function (params) {
        request.send(params);
        params = null;
    };
    
    this.cleanup = function () {

        if (tableView && tableView.get()) {
            this.remove(tableView.get());
        }

        tableViewRows = null;
        tableView     = null;
        request       = null;
        refresh       = null;
        that          = null;
        params        = null;
        this.menuOptions  = null;
        this.titleOptions = null;
    };
}

module.exports = window;