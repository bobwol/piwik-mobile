#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# A simple python script to fetch all available languages, fetch their translations and
# create a file for each language. The language file will contains only translations we need
# within Piwik Mobile. Stores the content in JSON having the following format:
# Object ( [language_key] => [language_translation] )
#
# Usage: ./updatelanguagefiles.py
#
import urllib, json

valid_translations =  {
        'Actions_SubmenuSitesearch':                                          'Site Search',
        'CorePluginsAdmin_Activate':                                          'Activate',
        'CorePluginsAdmin_Deactivate':                                        'Deactivate',
        'CoreHome_PeriodDay':                                                 'Day',
        'CoreHome_PeriodWeek':                                                'Week',
        'CoreHome_PeriodMonth':                                               'Month',
        'CoreHome_PeriodYear':                                                'Year',
        'CoreHome_PeriodRange':                                               'Range',
        'CoreHome_TableNoData':                                               'No data for this table.',
        'CoreUpdater_UpdateTitle':                                            'Update',
        'CustomVariables_CustomVariables':                                    'Custom Variables',
        'Feedback_DoYouHaveBugReportOrFeatureRequest':                        'Do you have a bug to report or a feature request?',
        'Feedback_ThankYou':                                                  'Thank you for helping us to make Piwik better!',
        'General_AboutPiwikX':                                                'About Piwik %s',
        'General_Date':                                                       'Date',
        'General_DateRangeFrom_js':                                           'From',
        'General_DateRangeTo_js':                                             'To',
        'General_Period':                                                     'Period',
        'General_Error':                                                      'Error',
        'General_Details':                                                    'Details',
        'General_Done':                                                       'Done',
        'General_Ok':                                                         'Ok',
        'General_Settings':                                                   'Settings',
        'General_Save':                                                       'Save',
        'General_ExceptionPrivilegeAtLeastOneWebsite':                        "You can't access this resource as it requires an %s access for at least one website.",
        'General_Close':                                                      'Close',
        'General_ColumnNbVisits':                                             'Visits',
        'General_ColumnPageviews':                                            'Pageviews',
        'General_CurrentWeek':                                                'Current Week',
        'General_CurrentMonth':                                               'Current Month',
        'General_CurrentYear':                                                'Current Year',
        'General_Delete':                                                     'Delete',
        'General_Edit':                                                       'Edit',
        'General_ErrorRequest':                                               'Oops... problem during the request, please try again.',
        'General_Faq':                                                        'FAQ',
        'General_ForExampleShort':                                            'eg.',
        'General_FromReferrer':                                               'From',
        'General_GiveUsYourFeedback':                                         'Give us Feedback!',
        'General_LoadingData':                                                'Loading data...',
        'General_LastDaysShort':                                              'Last %s days',
        'General_LongMonth_1':                                                'January',
        'General_LongMonth_2':                                                'February',
        'General_LongMonth_3':                                                'March',
        'General_LongMonth_4':                                                'April',
        'General_LongMonth_5':                                                'May',
        'General_LongMonth_6':                                                'June',
        'General_LongMonth_7':                                                'July',
        'General_LongMonth_8':                                                'August',
        'General_LongMonth_9':                                                'September',
        'General_LongMonth_10':                                               'October',
        'General_LongMonth_11':                                               'November',
        'General_LongMonth_12':                                               'December',
        'General_NewVisitor':                                                 'New Visitor',
        'General_Next':                                                       'Next',
        'General_No':                                                         'No',
        'General_NoDataForGraph':                                             'No data for this graph.',
        'General_NotValid':                                                   '%s is not valid',
        'General_NumberOfVisits':                                             'Number of visits',
        'General_Others':                                                     'Others',
        'General_PiwikXIsAvailablePleaseNotifyPiwikAdmin':                    '%s is available. Please notify the site administrator.',
        'General_Previous':                                                   'Previous',
        'General_PreviousDaysShort':                                          'Previous %s days',
        'General_Reports':                                                    'Reports',
        'General_Required':                                                   '%s required',
        'General_GeneralSettings':                                            'General Settings',
        'General_Subtotal':                                                   'Subtotal',
        'General_Today':                                                      'Today',
        'General_Unknown':                                                    'Unknown',
        'General_Value':                                                      'Value',
        'General_VisitConvertedNGoals':                                       'Visit converted %s Goals',
        'General_VisitorIP':                                                  'Visitor IP',
        'General_Visitors':                                                   'Visitors',
        'General_VisitType':                                                  'Visitor type',
        'General_Yes':                                                        'Yes',
        'General_Yesterday':                                                  'Yesterday',
        'General_YourChangesHaveBeenSaved':                                   'Your changes have been saved.',
        'Goals_AbandonedCart':                                                'Abandoned Cart',
        'Goals_Ecommerce':                                                    'Abandoned',
        'Goals_EcommerceOrder':                                               'Ecommerce order',
        'Live_GoalRevenue':                                                    'Revenue',
        'Live_LastHours':                                                     'Last %s hours',
        'Live_LastMinutes':                                                   'Last %s minutes',
        'Live_VisitorsInRealTime':                                            'Visitors in Real Time',
        'Live_VisitorLog':                                                    'Visitor Log',
        'Login_Login':                                                        'Username',
        'Login_Password':                                                     'Password',
        'SEO_Rank':                                                           'Rank',
        'SitesManager_Cancel_js':                                             'Cancel',
        'SitesManager_ExceptionInvalidUrl':                                   "The url '%s' is not a valid URL.",
        'UserCountry_Country':                                                'Country',
        'UsersManager_ManageAccess':                                          'Manage access',
        'UsersManager_PrivView':                                              'View',
        'UserSettings_ColumnBrowser':                                         'Browser',
        'UserSettings_Plugins':                                               'Plugins',
        'UserSettings_ColumnResolution':                                      'Resolution',
        'UserSettings_VisitorSettings':                                       'Visitor Settings',
        'VisitsSummary_NbVisits':                                             '%s visits',
        'VisitsSummary_EvolutionOverLastPeriods':                             'Evolution over the last %s',
        'VisitsSummary_NbActions':                                            '%s actions',
        'General_InvalidResponse':                                            'The received data is invalid.',
        'General_ChooseLanguage':                                             'Choose language',
        'General_ChoosePeriod':                                               'Choose period',
        'General_ChooseWebsite':                                              'Choose website',
        'General_ChooseDate':                                                 'Choose date',
        'General_Language':                                                   'Language',
        'General_PleaseUpdatePiwik':                                          'Please update your Piwik',
        'General_RequestTimedOut':                                            'A data request to %s timed out. Please try again.',
        'General_Outlink':                                                    'Outlink',
        'General_Download':                                                   'Download',
        'General_Goal':                                                       'Goal',
        'General_Help':                                                       'Help',
        'General_Visitor':                                                    'Visitor',
        'Mobile_Accounts':                                                    'Accounts',
        'Mobile_AddAccount':                                                  'Add account',
        'Mobile_AddPiwikDemo':                                                'Add Piwik Demo',
        'Mobile_Advanced':                                                    'Advanced',
        'Mobile_AnonymousAccess':                                             'Anonymous access',
        'Mobile_AnonymousTracking':                                           'Anonymous tracking',
        'Mobile_AskForAnonymousTrackingPermission':                           'Would you like to enable anonymous usage tracking in Piwik Mobile? You can also disable/enable anonymous tracking in Settings.',
        'Mobile_AccessUrlLabel':                                              'Piwik Access Url',
        'Mobile_ChooseHttpTimeout':                                           'Choose HTTP timeout value',
        'Mobile_ChooseMetric':                                                'Choose Metric',
        'Mobile_ChooseReport':                                                'Choose a report',
        'Mobile_DefaultReportDate':                                           'Report date',
        'Mobile_EnableGraphsLabel':                                           'Display graphs',
        'Mobile_EvolutionGraph':                                              'Evolution Graph',
        'Mobile_StaticGraph':                                                 'Static Graph',
        'Mobile_HelpUsToImprovePiwikMobile':                                  'Would you like to enable anonymous usage tracking in Piwik Mobile?',
        'Mobile_HttpIsNotSecureWarning':                                      "Your Piwik authorization token (token_auth) is sent in clear text if you use 'HTTP'. For this reason we recommend HTTPS for secure transport of data over the internet. Do you want to proceed?",
        'Mobile_HowtoDeleteAnAccountOniOS':                                   'Swipe to right to delete an account',
        'Mobile_LastUpdated':                                                 'Last Updated: %s',
        'Mobile_LoginCredentials':                                            'Credentials',
        'Mobile_LoginUseHttps':                                               'Use https',
        'Mobile_MultiChartLabel':                                             'Display sparklines',
        'Mobile_NavigationBack':                                              'Back',
        'Mobile_NetworkErrorWithStatusCode':                                  'There was an error "%s". The request returned the status "%s". URL was "%s". Please check your entered URL and the error logs on this server for more information about the error and how to resolve it.',
        'Mobile_NetworkNotReachable':                                         'Network not reachable',
        'Mobile_NoPiwikAccount':                                              'No Piwik Account?',
        'Mobile_NoVisitorFound':                                              'No visitor found',
        'Mobile_NoWebsiteFound':                                              'No website found',
        'Mobile_PullDownToRefresh':                                           'Pull down to refresh...',
        'Mobile_RatingNotNow':                                                'Not now',
        'Mobile_RatingNow':                                                   "OK, I'll rate it now",
        'Mobile_RatingDontRemindMe':                                          "Don't remind me",
        'Mobile_RatingPleaseRateUs':                                          'Piwik Mobile App is a Free Software, we would really appreciate if you took 1 minute to rate the app in the %s. If you have suggestions of new features or bug reports, please contact %s',
        'Mobile_Refresh':                                                     'Refresh',
        'Mobile_Reloading':                                                   'Reloading...',
        'Mobile_ReleaseToRefresh':                                            'Release to refresh...',
        'Mobile_SaveSuccessError':                                            'Please verify settings',
        'Mobile_SearchWebsite':                                               'Search websites',
        'Mobile_ShowAll':                                                     'Show all',
        'Mobile_ShowLess':                                                    'Show less',
        'Mobile_UseSearchBarHint':                                            'Only the first %s websites are displayed here. Please use the search bar to access your other websites.',
        'Mobile_HttpTimeout':                                                 'HTTP Timeout',
        'Mobile_VerifyAccount':                                               'Verifying Account',
        'Mobile_VerifyLoginData':                                             'Make sure your entered login data is correct.',
        'Mobile_YouAreOffline':                                               'Sorry, you are currently offline'
}

lang_params  = urllib.urlencode({'module': 'API', 'method': 'LanguagesManager.getAvailableLanguages', 'format': 'JSON', 'token_auth': 'anonymous'})

lang_handle  = urllib.urlopen("http://demo.piwik.org/?%s" % lang_params, proxies=None)
lang_content = lang_handle.read()
lang_array   = json.loads(lang_content)
for lang in lang_array:
    lang = lang[0]
    print 'found language ' + lang

    translation_params  = urllib.urlencode({'module': 'API', 'method': 'LanguagesManager.getTranslationsForLanguage', 'languageCode' : lang, 'format': 'JSON', 'token_auth': 'anonymous'}) 
    translation_handle  = urllib.urlopen("http://demo.piwik.org?%s" % translation_params, proxies=None);
    translation_content = translation_handle.read()
    translation_array   = json.loads(translation_content)

    result = {}
    for translation in translation_array:
        if translation['label'] in valid_translations:
            result[translation['label']] = translation['value']

    result_content = 'module.exports = ' + json.dumps(result) + ';'
    file = open('../Resources/i18n/' + lang + '.js', 'w')
    file.write(result_content)
    file.close()
    print 'language ' + lang + ' processed'
