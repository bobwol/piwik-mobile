/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');

/**
 * @class     Open Graph in detail view command. Opens the graph in fullscreen on iOS and within a new window on 
 *            Android.
 *
 * @exports   OpenGraphDetailCommand as Piwik.Command.OpenGraphDetailCommand
 * @augments  Piwik.UI.View
 */
function OpenGraphDetailCommand () {

}
    
/**
 * Extend Piwik.UI.View
 */
OpenGraphDetailCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
OpenGraphDetailCommand.prototype.getId = function () {};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
OpenGraphDetailCommand.prototype.getLabel = function () {};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
OpenGraphDetailCommand.prototype.getButtonLabel = function () {};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
OpenGraphDetailCommand.prototype.getMenuIcon = function () {};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
OpenGraphDetailCommand.prototype.getMenuTrackingEvent = function () {};

/**
 * Execute the command.
 */
OpenGraphDetailCommand.prototype.execute = function () {
    
    var graphUrl = this.getParam('graphUrl');

    if (!graphUrl) {

        return;
    }
    
    if (!Piwik.getPlatform().isIos) {
        this.create('Window', {url: 'graph/fulldetail',
                               target: 'modal',
                               graphUrl: graphUrl});

    } else {
        
        var reportName = this.getParam('reportName', '');
        var reportDate = this.getParam('reportDate', '');
        
        var winParams  = {opacity: 0,backgroundColor: 'white'};
        
        if (Piwik.getPlatform().isIpad) {
            winParams.orientationModes = [Ti.UI.orientation];
        }

        var win = Ti.UI.createWindow(winParams);
        win.open({opacity: 1, duration: 400});
        
        var width  = (win.size && win.size.width) ? win.size.width : Ti.Platform.displayCaps.platformWidth;
        var height = (win.size && win.size.height) ? win.size.height : Ti.Platform.displayCaps.platformHeight;

        var pictureHeight = height - 20;   // 10px space top and bottom
        var pictureWidth  = width - 20;    // 10px space left and right

        if (Piwik.getPlatform().isIpad) {
            pictureHeight = height -  Math.floor(height / 4) - 20; // 75% - 20px (10px space top and bottom)
        }

        var graph            = Piwik.require('PiwikGraph');
        var graphUrlWithSize = graph.appendSize(graphUrl, pictureWidth, pictureHeight, true);
        graphUrlWithSize     = graph.setParams(graphUrlWithSize, {showMetricTitle: 1, legendAppendMetric: 1});

        Piwik.getLog().debug('piwik graphUrl is ' + graphUrlWithSize, 'OpenGraphDetailCommand::execute');
    
        var imageView = this.create('ImageView', {width: pictureWidth, height: pictureHeight,
                                                  canScale: true,
                                                  hires: true,
                                                  enableZoomControls: false,
                                                  image: graphUrlWithSize});
                                                  
        if (!Piwik.getPlatform().isIpad) {
                    
            function rotateImage (event) {
                if (!imageView || !win || !graph) {
                    
                    return;
                }
                
                var width  = (win.size && win.size.width) ? win.size.width : Ti.Platform.displayCaps.platformWidth;
                var height = (win.size && win.size.height) ? win.size.height : Ti.Platform.displayCaps.platformHeight;
        
                pictureWidth       = width - 20;
                pictureHeight      = height - 20;

                imageView.width    = pictureWidth;
                imageView.height   = pictureHeight;
                graphUrlWithSize   = graph.appendSize(graphUrl, pictureWidth, pictureHeight, true);
                graphUrlWithSize   = graph.setParams(graphUrlWithSize, {showMetricTitle: 1, legendAppendMetric: 1});
            
                imageView.image    = graphUrlWithSize;
            }
            
            Ti.Gesture.addEventListener('orientationchange', rotateImage);
        }
                                              
        imageView.addEventListener('click', function () {
            if (!win) {
                return;
            }
            
            win.close({opacity: 0, duration: 300});
            graph     = null;
            imageView = null;
            win       = null;
            
            try {
                if (!Piwik.getPlatform.isIpad) {
                    Ti.Gesture.removeEventListener('orientationchange', rotateImage);
                }
            } catch (e) {
                Piwik.getLog().warn('Failed to remove orientationchange event listener', 'OpenGraphDetailCommand::execute');
            }
        });

        win.addEventListener('click', function () {
            if (!win) {
                return;
            }
            
            win.close({opacity: 0, duration: 300});
            graph     = null;
            imageView = null;
            win       = null;
            
            try {
                if (!Piwik.getPlatform.isIpad) {
                    Ti.Gesture.removeEventListener('orientationchange', rotateImage);
                }
            } catch (e) {
                Piwik.getLog().warn('Failed to remove orientationchange event listener', 'OpenGraphDetailCommand::execute');
            }
        });
        
        if (Piwik.getPlatform().isIpad) {
            var quarter   = Math.floor(height / 4); // 25%
            var labelView = Ti.UI.createView({className: 'graphiPadDetailLabelContainerView'});
            var topView   = Ti.UI.createImageView({height: quarter, className: 'graphiPadDetailTopContainerView'});
            
            if (reportName) {
                labelView.add(Ti.UI.createLabel({text: reportName, className: 'graphiPadDetailReportName'}));
            }
            
            if (reportDate) {
                labelView.add(Ti.UI.createLabel({text: reportDate, className: 'graphiPadDetailReportDate'}));
            }
            
            topView.add(labelView);
            labelView = null;
            
            topView.add(Ti.UI.createImageView({className: 'graphiPadDetailTopViewSeparator'}));
            
            win.add(topView);
            topView = null;
            
            var bottomView = Ti.UI.createImageView({top: quarter, className: 'graphiPadDetailBottomContainerView'});
            bottomView.add(imageView);
            
            win.add(bottomView);
            bottomView = null;
            
        } else {
            
            win.add(imageView);
         
        }
        
    }
    
};

/**
 * Undo the executed command.
 */
OpenGraphDetailCommand.prototype.undo = function () {
    
};

module.exports = OpenGraphDetailCommand;