/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'settings/index.js' .
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     Lets the user change the settings like language, default report date and so on.
 *
 * @exports   window as WindowSettingsIndex
 * @this      Piwik.UI.Window
 * @augments  Piwik.UI.Window
 */
function window () {

    /**
     * @see  Piwik.UI.Window#titleOptions
     */
    this.titleOptions = {title: _('General_Settings')};

    /**
     * @see  Piwik.UI.Window#menuOptions
     */
    this.menuOptions  = {};

    var that          = this;
    var tableData     = [];
    var tableview     = this.create('TableView', {id: 'settingsTableView'});

    tableview.addEventListener('click', function (event) {

        if (!event || !event.row || !event.row.onClick) {
            return;
        }
        
        event.row.onClick.apply(event.row, [event]);
        
        event = null;
    });
    
    this.add(tableview.get());

    this.addEventListener('onopen', function (indexEvent) {
        
        if (!that) {
            
            return;
        }
        
        if (!indexEvent) {
            
            indexEvent = {};
        }
        
        if (tableview) {
            tableview.reset();
        }
        
        var onChangeAnonymousTracking = function (event) {

            this.setHasCheck(!this.getHasCheck());

            var settings  = Piwik.require('App/Settings');
            settings.setTrackingEnabled(this.getHasCheck());
            settings      = null;
  
            var action    = this.getHasCheck() ? 'enable' : 'disable';
            Piwik.getTracker().trackEvent({title: 'Anonymous Tracking ' + action,
                                           url: '/settings/anonymous-tracking/' + action});

            var alertDialog = Ti.UI.createAlertDialog({
                message: _('Mobile_AskForAnonymousTrackingPermission'),
                buttonNames: [_('General_Ok')]
            });
            
            alertDialog.show();
            alertDialog = null;
        };

        var onChangeSparkline = function (event) {

            this.setHasCheck(!this.getHasCheck());

            var action    = this.getHasCheck() ? 'enable' : 'disable';
            Piwik.getTracker().trackEvent({title: 'Multisite Graphs ' + action,
                                           url: '/settings/multisite-graphs/' + action});

            var settings  = Piwik.require('App/Settings');
            settings.setPiwikMultiChart(this.getHasCheck());
            settings      = null;
        };

        var onChangeGraphs = function (event) {

            this.setHasCheck(!this.getHasCheck());

            var action    = this.getHasCheck() ? 'enable' : 'disable';
            Piwik.getTracker().trackEvent({title: 'Graphs ' + action,
                                           url: '/settings/graphs/' + action});

            var settings  = Piwik.require('App/Settings');
            settings.setGraphsEnabled(this.getHasCheck());
            settings      = null;
        };

        // an array like ['English', 'German', ...]
        var availableLanguageOptions = [];
        var currentLanguage          = 'English';

        // indexEvent.availableLanguages: an object like {en: 'English', de: 'German', ...}
        for (var langCode in indexEvent.availableLanguages) {

            availableLanguageOptions.push(indexEvent.availableLanguages[langCode]);

            if (indexEvent.piwikLanguage && indexEvent.piwikLanguage == langCode) {
                currentLanguage = indexEvent.availableLanguages[langCode];
            }
        }

        // a sorted list/array of available languages names
        availableLanguageOptions.sort();
        availableLanguageOptions.push(_('SitesManager_Cancel_js'));

        // detect current selected language index so we are able to preselect it later...
        // index changes after previous sort. therefore we have to do this here and not in the for loop above
        var currentLangIndex     = null;
        for (var index in availableLanguageOptions) {
            if (currentLanguage && availableLanguageOptions[index] == currentLanguage) {
                currentLangIndex = index;
                break;
            }
        }

        var onChangeLanguage = function (event) {

            var langDialog = Ti.UI.createOptionDialog({
                title: _('General_ChooseLanguage'),
                options: availableLanguageOptions,
                cancel: (availableLanguageOptions.length - 1)
            });

            if (null !== currentLangIndex) {
                langDialog.selectedIndex = currentLangIndex;
            }

            var row = this;

            langDialog.addEventListener('click', function (event) {

                // android reports cancel = true whereas iOS returns the previous defined cancel index
                if (!event || event.cancel === event.index || true === event.cancel) {

                    return;
                }

                // user selected same value as already selected
                if (event.index == currentLangIndex) {

                    return;
                }
                
                if (!row) {
                    
                    return;
                }

                row.changeValue(availableLanguageOptions[event.index]);
                currentLangIndex = event.index;

                for (var langCode in indexEvent.availableLanguages) {
                    if (availableLanguageOptions[event.index] == indexEvent.availableLanguages[langCode]) {

                        // usually, we should not use an piwik.require within a for loop, but it will do this only once
                        // and then break the loop
                        var settings = Piwik.require('App/Settings');
                        settings.setLanguage(langCode);
                        settings     = null;

                        Piwik.getTracker().trackEvent({title: 'Language Change',
                                                       url: '/settings/change-language/' + langCode});

                        var translation = Piwik.require('Locale/Translation');
                        translation.load();
                        translation     = null;

                        // reopen window so new selected translation is directly visible. At least in this window
                        // @todo fire a Ti.App event. Welcome screen should refresh its list of available websites too
                        that.open();
                        break;
                    }
                }
                
                row = null;
            });

            langDialog.show();
            langDialog = null;
        };

        var defaultReportDateLabel = '';
        var currentReportDateIndex = null;
        var settings               = Piwik.require('App/Settings');

        // detect current selected default report date. So we are able to display the current value and to preselect
        // the current selected value.
        var availableOptions = Piwik.require('PiwikDate').getAvailableDateRanges();
        for (var index in availableOptions) {
            
            if (availableOptions[index] &&
                availableOptions[index].period == settings.getPiwikDefaultPeriod() &&
                availableOptions[index].date == settings.getPiwikDefaultDate()) {

                defaultReportDateLabel = availableOptions[index].label;
                currentReportDateIndex = index;

            }
        }

        var onChangeDefaultReportDate = function () {
            
            var periodOptions    = [];
            
            // an array of all available default report date options
            var availableOptions = Piwik.require('PiwikDate').getAvailableDateRanges();
            for (var index in availableOptions) {
                periodOptions.push(availableOptions[index].label);
            }
            
            periodOptions.push(_('SitesManager_Cancel_js'));

            var periodDialog  = Ti.UI.createOptionDialog({
                title: _('Mobile_DefaultReportDate'),
                options: periodOptions,
                cancel: periodOptions.length - 1
            });

            if (null !== currentReportDateIndex) {
                // preselect current selected value
                periodDialog.selectedIndex = currentReportDateIndex;
            }

            var row = this;

            periodDialog.addEventListener('click', function (event) {
                var settings = Piwik.require('App/Settings');
                var session  = Piwik.require('App/Session');

                // android reports cancel = true whereas iOS returns the previous defined cancel index
                if (!event || event.cancel === event.index || true === event.cancel) {
                    row = null;

                    return;
                }

                // user selected same value as already selected
                if (event.index == currentReportDateIndex) {
                    row = null;
                    
                    return;
                }
                
                if (!row) {
                    
                    return;
                }
                
                if (!availableOptions[event.index]) {
                    
                    return;
                }

                // display changed value in row and update the current report date index. This ensures the correct
                // value will be preselected if user opens the periodDialog again.
                row.changeValue(periodOptions[event.index]);
                currentReportDateIndex = event.index;
            
                settings.setPiwikDefaultReportDate(availableOptions[event.index].period, 
                                                   availableOptions[event.index].date);

                var chPeriod = settings.getPiwikDefaultPeriod();
                var chDate   = settings.getPiwikDefaultDate();
                Piwik.getTracker().trackEvent({title: 'Default Report Date Change',
                                               url: '/settings/change-defaultreportdate/' + chPeriod + '/' + chDate});

                session.set('piwik_parameter_period', settings.getPiwikDefaultPeriod());
                session.set('piwik_parameter_date', settings.getPiwikDefaultDate());
                
                row              = null;
                session          = null;
                settings         = null;
                availableOptions = null;
            });

            periodDialog.show();
            periodDialog = null;
        };

        var onManageAccess = function () {
            that.create('Window', {url: 'settings/manageaccounts', target: 'modal'});
        };

        var onChangeHttpTimeout = function () {

            // an array of all available timeout options
            var timeoutValues = ['15s', '30s', '45s', '60s', '90s', '120s', '150s', '180s', '300s', '450s', '600s', '1000s', _('SitesManager_Cancel_js')];

            var timeoutDialog = Ti.UI.createOptionDialog({
                title: _('Mobile_ChooseHttpTimeout'),
                options: timeoutValues,
                cancel: (timeoutValues.length - 1)
            });

            var row = this;

            timeoutDialog.addEventListener('click', function (event) {

                // android reports cancel = true whereas iOS returns the previous defined cancel index
                if (!event || event.cancel === event.index || true === event.cancel) {
                    row = null;
                    
                    return;
                }
                
                if (!row) {
                    
                    return;
                }

                var timeoutValue = timeoutValues[event.index];

                row.changeValue(timeoutValue);

                timeoutValue     = parseInt(timeoutValue.replace('s', ''), 10) * 1000;

                Piwik.getTracker().trackEvent({title: 'Timeout Value',
                                               url: '/settings/change-httptimeout/' + timeoutValue});

                var settings     = Piwik.require('App/Settings');
                settings.setHttpTimeout(timeoutValue);
                
                settings         = null;
                row              = null;
            });

            timeoutDialog.show();
            timeoutDialog = null;
        };

        var onShowHelpAbout = function () {
            that.create('Window', {url: 'help/about', target: 'modal'});
        };

        var onShowHelpFeedback = function () {
            that.create('Window', {url: 'help/feedback', target: 'modal'});
        };

        tableData = [that.create('TableViewRow', {className: 'settingsTableViewRowHasDetail',
                                                  title: _('UsersManager_ManageAccess'),
                                                  onClick: onManageAccess,
                                                  hasCheck: false,
                                                  hasChild: true,
                                                  hasDetail: false}),
                     that.create('TableViewSection', {title: _('General_GeneralSettings'), 
                                                      style: 'native'}),
                     that.create('TableViewRow', {className: Piwik.getPlatform().isIos ? 'settingsTableViewRowHasChild' : 'settingsTableViewRow',
                                                  title: _('General_Language'),
                                                  onClick: onChangeLanguage,
                                                  value: currentLanguage,
                                                  hasChild: Piwik.getPlatform().isIos}),
                     that.create('TableViewRow', {className: Piwik.getPlatform().isIos ? 'settingsTableViewRowHasChild' : 'settingsTableViewRow',
                                                  title: _('Mobile_DefaultReportDate'),
                                                  onClick: onChangeDefaultReportDate,
                                                  value: defaultReportDateLabel,
                                                  hasChild: Piwik.getPlatform().isIos}),
                     that.create('TableViewRow', {className: 'settingsTableViewRowHasCheck',
                                                  title: _('Mobile_AnonymousTracking'),
                                                  onClick: onChangeAnonymousTracking,
                                                  hasCheck: Boolean(indexEvent.trackingEnabled)}),
                     that.create('TableViewRow', {className: 'settingsTableViewRowHasCheck',
                                                  title: _('Mobile_MultiChartLabel'),
                                                  onClick: onChangeSparkline,
                                                  hasCheck: Boolean(indexEvent.piwikMultiCharts)}),
                     that.create('TableViewRow', {className: 'settingsTableViewRowHasCheck',
                                                  title: _('Mobile_EnableGraphsLabel'),
                                                  onClick: onChangeGraphs,
                                                  hasCheck: Boolean(indexEvent.graphsEnabled)}),
                     that.create('TableViewSection', {title: _('Mobile_Advanced'), 
                                                      style: 'native'}),
                     that.create('TableViewRow', {className: Piwik.getPlatform().isIos ? 'settingsTableViewRowHasChild' : 'settingsTableViewRow',
                                                  title: _('Mobile_HttpTimeout'),
                                                  hasChild: Piwik.getPlatform().isIos,
                                                  onClick: onChangeHttpTimeout,
                                                  value: Math.round(settings.getHttpTimeout() / 1000) + 's'}),
                     that.create('TableViewSection', {title: _('General_Help'), 
                                                      style: 'native'}),
                     that.create('TableViewRow', {className: 'settingsTableViewRowHasDetail',
                                                  title: String.format(_('General_AboutPiwikX'), 'Mobile'),
                                                  onClick: onShowHelpAbout,
                                                  hasDetail: Piwik.getPlatform().isIos}),
                     that.create('TableViewRow', {className: 'settingsTableViewRowHasDetail',
                                                  title: _('General_GiveUsYourFeedback'),
                                                  onClick: onShowHelpFeedback,
                                                  hasDetail: Piwik.getPlatform().isIos}),
                     that.create('TableViewRow', {className: 'settingsTableViewRowHasDetail',
                                                  title: _('General_Faq'),
                                                  command: this.createCommand('OpenFaqCommand'),
                                                  hasDetail: Piwik.getPlatform().isIos})];

        if (tableview) {
            tableview.setData(tableData);
        }
        
        tableData = null;
    });

    /**
     * Get current settings and fire the onopen event. Since there is no network request to get the current settings
     * we could also get these values right on top of the window method and use them directly. But by querying the data
     * set in the open method, we have the opportunity to call the open method again and can therefore easily reload
     * the view. For example after changing the language.
     */
    this.open = function () {

        var settings = Piwik.require('App/Settings');
        var locale   = Piwik.require('Locale');

        var eventResult = {type: 'onopen'};

        eventResult.piwikMultiCharts   = settings.getPiwikMultiChart();
        eventResult.piwikLanguage      = settings.getLanguage();
        eventResult.graphsEnabled      = settings.getGraphsEnabled();
        eventResult.trackingEnabled    = settings.isTrackingEnabled();
    //    eventResult.preferEvolutionGraphs = settings.getPreferEvoltuionGraphs();
        eventResult.availableLanguages = locale.getAvailableLanguages();

        this.fireEvent('onopen', eventResult);
        
        settings    = null;
        locale      = null;
        eventResult = null;
    };
    
    this.cleanup = function () {

        if (tableview && tableview.get()) {
            this.remove(tableview.get());
        }

        tableview = null;
        that      = null;
        this.menuOptions     = null;
        this.titleOptions    = null;
    };
}

module.exports = window;