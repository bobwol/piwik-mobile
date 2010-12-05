/*
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview View template visitors/country.
 */

/**
 * View template. 
 *
 * @this {View}
 */
function template () {
    
    var site       = this.site;
    var top        = 0;
    
    this.addEventListener('dateChanged', function (event) {
    
        var params                = this.params;
        params.date               = event.date;
        params.closeCurrentWindow = true;
    
        Window.createMvcWindow(params);    
    });
    
    this.addEventListener('periodChanged', function (event) {
    
        var params                = this.params;
        params.period             = event.period;
        params.closeCurrentWindow = true;
    
        Window.createMvcWindow(params);    
    });
    
    this.addEventListener('siteChanged', function (event) {
    
        var params                = this.params;
        params.site               = event.site;
        params.closeCurrentWindow = true;
    
        Window.createMvcWindow(params);    
    });
    
    var scrollView = Titanium.UI.createScrollView({
        contentWidth: 'auto',
        contentHeight: 'auto',
        top: 0,
        showVerticalScrollIndicator: false,
        showHorizontalScrollIndicator: false
    });
    
    this.add(scrollView);
    
    var box            = this.helper('borderedContainer', {top: top});
    var headline       = this.helper('headline', {headline: this.metadata.name});
    
    box.subView.add(headline.subView);
    top                = headline.subView.height;
    
    var dateChooser    = this.helper('parameterChooser', {date: this.date, 
                                                          dateDescription: this.reportDate,
                                                          period: this.period,
                                                          currentSite: site,
                                                          top: top,
                                                          allowedSites: this.allowedSites});
    
    box.subView.add(dateChooser.subView);
    
    top                = dateChooser.subView.top + dateChooser.subView.height;

    if (this.graphsEnabled && this.graphReport && this.graphData) {
     
        var graphUrl = null;
         switch (this.graphReport.chartType) {
             case 'bar': 
                 graphUrl   = Graph.getBarChartUrl(this.graphData);
                 break;
                 
             default:
                 graphUrl   = Graph.getPieChartUrl(this.graphData);
         }

        var graph      = this.helper('graph', {title: this.metadata.name,
                                               graphUrl: graphUrl,
                                               top: top});
        
        box.subView.add(graph.subView);
        top            = graph.subView.top + graph.subView.height;
    }

    box.subView.height = top;

    var headlineStats  = {title: this.columns.label ? this.columns.label : this.dimension, 
                          value: this.columns[this.sortOrderColumn] ? this.columns[this.sortOrderColumn] : this.columns.value};
                         
    var visitorStats   = this.helper('statisticList', {values: this.reportData, 
                                                       top: top,
                                                       headline: headlineStats});
    
    box.subView.height = visitorStats.subView.top + visitorStats.subView.height + 1;
    
    box.subView.add(visitorStats.subView);
    
    scrollView.add(box.subView);
    scrollView.contentHeight = box.subView.height + box.subView.top + 5;
}
