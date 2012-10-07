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
        
        var fromTransform  = Ti.UI.create2DMatrix().scale(0);
        var toTransform    = Ti.UI.create2DMatrix().scale(1.0);
        var startAnimation = Ti.UI.createAnimation({transform: toTransform, duration: 400});
        
        var win = Ti.UI.createWindow({top: 0, left: 0, right: 0, bottom: 0,
                                      transform: fromTransform,
                                      orientationModes: [Ti.UI.orientation],
                                      backgroundColor: 'white'});
        win.open(startAnimation);
        
        var width  = (win.size && win.size.width) ? win.size.width : Ti.Platform.displayCaps.platformWidth;
        var height = (win.size && win.size.height) ? win.size.height : Ti.Platform.displayCaps.platformHeight;

         var pictureHeight = height - 20;   // 10px space top and bottom
         var pictureWidth  = width - 20;    // 10px space left and right

         if (Piwik.getPlatform().isIpad) {
             pictureHeight = Math.floor(height / 2);
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
                                              
        imageView.addEventListener('click', function () {

            win.close({transform: Ti.UI.create2DMatrix().scale(0), duration: 300});
            win = null;
        });
        
        if (Piwik.getPlatform().isIpad) {
            var quarter = Math.floor(height / 4); // 25%
            var labelView = Ti.UI.createView({layout: 'vertical', height: 'SIZE', width: 'SIZE', left: 0, right: 0});
            //  "Read the 'Please read' post - Days to conversion"  -  'Week 12 November - 19 November 2012'
            var topView = Ti.UI.createImageView({top: 0, height: quarter, left: 0, right: 0, backgroundColor: '#bbbbbb'});
            labelView.add(Ti.UI.createLabel({text: 'Page URLs', ellipsize: true, wordWrap: false, color: '#333333', textAlign: 'center', left: 20, right: 20, font: {fontSize: 48}}));
            labelView.add(Ti.UI.createLabel({text: 'Saturday 6th October 2012', ellipsize: true, wordWrap: false, textAlign: 'center', top: 25, left: 20, right: 20, color: '#777777', font: {fontSize: 36}}));
            
            topView.add(labelView);
            topView.add(Ti.UI.createImageView({bottom: 0, height: 2, backgroundColor: '#aaaaaa', left: 0, right: 0}));
            
            win.add(topView);
            
            var bottomView = Ti.UI.createImageView({top: quarter, bottom: 0, left: 0, right: 0});
            
            bottomView.add(imageView);
            win.add(bottomView);
        } else {
            
            win.add(imageView);
        }
    
        
        graph          = null;
        imageView      = null;
        fromTransform  = null;
        toTransform    = null;
        startAnimation = null;
    }
    
};

/**
 * Undo the executed command.
 */
OpenGraphDetailCommand.prototype.undo = function () {
    
};

module.exports = OpenGraphDetailCommand;