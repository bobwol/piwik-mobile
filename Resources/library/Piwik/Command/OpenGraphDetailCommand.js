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

        var win = Ti.UI.createWindow({top: 0, left: 0, right: 0, bottom: 0, opacity: 0,
                                      orientationModes: [Ti.UI.orientation],
                                      backgroundColor: 'white'});
        win.open({opacity: 1, duration: 400});
        
          /*
        var closeButton = Titanium.UI.createButton({
            title:'Close',
            style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
            color: '#333333'
        });
      
        var revert = Titanium.UI.createButton({
            title:'Show Evolution',
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            color: '#333333'
        });
        
        var revert2 = Titanium.UI.createButton({
            title:'Evolution Graphs Enabled',
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            color: '#333333'
        });
        
        var flexSpace = Titanium.UI.createButton({
            systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
       
        var toolbar = Titanium.UI.iOS.createToolbar({
            items:[closeButton],
            top: 0,
            borderTop:false,
            borderBottom:false,
            barColor:'#bbb',
            opacity:0.7,
            translucent: true,
            zIndex: 999,
            height: 20
        });
        
        win.add(toolbar);

        closeButton.addEventListener('click', function () {
            if (win) {
                win.close({opacity: 0, duration: 300});
                win = null;
            }
        });
 */
        var width  = (win.size && win.size.width) ? win.size.width : Ti.Platform.displayCaps.platformWidth;
        var height = (win.size && win.size.height) ? win.size.height : Ti.Platform.displayCaps.platformHeight;

        var pictureHeight = height - 20;   // 10px space top and bottom
        var pictureWidth  = width - 20;    // 10px space left and right

        if (Piwik.getPlatform().isIpad) {
            pictureHeight = height -  Math.floor(height / 4) - 20;
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
            if (win) {
                win.close({opacity: 0, duration: 300});
                win = null;
            }
        });
                                              
        win.addEventListener('click', function () {
            if (win) {
                win.close({opacity: 0, duration: 300});
                win = null;
            }
        });
        if (Piwik.getPlatform().isIpad) {
            var quarter   = Math.floor(height / 4); // 25%
            var labelView = Ti.UI.createView({layout: 'vertical', height: 'SIZE', width: 'SIZE', left: 0, right: 0});
            var topView   = Ti.UI.createImageView({top: 0, height: quarter, left: 0, right: 0, backgroundColor: '#bbbbbb'});
            labelView.add(Ti.UI.createLabel({text: reportName, ellipsize: true, wordWrap: false, color: '#333333', textAlign: 'center', left: 20, right: 20, font: {fontSize: 48}}));
            labelView.add(Ti.UI.createLabel({text: reportDate, ellipsize: true, wordWrap: false, textAlign: 'center', top: 25, left: 20, right: 20, color: '#777777', font: {fontSize: 36}}));
            
            topView.add(labelView);
            topView.add(Ti.UI.createImageView({bottom: 0, height: 2, backgroundColor: '#aaaaaa', left: 0, right: 0}));
            
            win.add(topView);
            
            var bottomView = Ti.UI.createImageView({top: quarter, bottom: 0, left: 0, right: 0});
            
            bottomView.add(imageView);
            win.add(bottomView);
        } else {
            
            win.add(imageView);
        }

        graph     = null;
        imageView = null;
    }
    
};

/**
 * Undo the executed command.
 */
OpenGraphDetailCommand.prototype.undo = function () {
    
};

module.exports = OpenGraphDetailCommand;