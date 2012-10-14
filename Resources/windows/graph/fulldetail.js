/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'graph/fulldetail.js' .
 */

/** @private */
var Piwik = require('library/Piwik');

/**
 * @class     Displays the current graph in full screen on the device.
 *
 * @property  {Object}  params
 * @property  {string}  params.graphUrl      The graph url without any size parameters
 * @property  {string}  [params.reportName]  An optional report nam.
 * @property  {string}  [params.reportDate]  An optional report date
 *
 * @exports   window as WindowGraphFulldetail
 * @this      Piwik.UI.Window
 * @augments  Piwik.UI.Window
 */
function window (params) {
    
    this.getViewWidth = function () {
        return (this.size && this.size.width) ? this.size.width : Ti.Platform.displayCaps.platformWidth;
    };
    
    this.getViewHeight = function () {
        return (this.size && this.size.height) ? this.size.height : Ti.Platform.displayCaps.platformHeight;
    };
    
    this.getPictureWidth = function () {
        return this.getViewWidth() - 20; // 10px space top and bottom
    };
    
    this.getPictureHeight = function () {
        var height        = this.getViewHeight();
        var pictureHeight = 0;
        
        if (Piwik.getPlatform().isIpad) {
            pictureHeight = height -  Math.floor(height / 4) - 20; // 75% - 20px (10px space top and bottom)
        } else {
            pictureHeight = height - 20; // 10px space left and right
        }
        
        return pictureHeight;
    };
    
    this.getOrientationSpecificWidth = function (isLandscape) {
        
        var width  = win.getViewWidth();
        var height = win.getViewHeight();
        var pictureWidth  = 0;

        // we have to detect current width/height after orientation change... 
        if (isLandscape) {
            if (width > height) {
                pictureWidth  = width - 20;
            } else {
                pictureWidth  = height - 20;
            }
        } else {
            if (width > height) {
                pictureWidth  = height - 20
            } else {
                pictureWidth  = width - 20;
            }
        }
        
        event = null;
        
        return pictureWidth;
    }
    this.getOrientationSpecificHeight = function (isLandscape) {
        
        var width  = win.getViewWidth();
        var height = win.getViewHeight();
        var pictureHeight = 0;

        // we have to detect current width/height after orientation change... 
        if (isLandscape) {
            if (width > height) {
                pictureHeight = height - 20;
            } else {
                pictureHeight = width - 40;
            }
        } else {
            if (width > height) {
                pictureHeight = width - 40;
            } else {
                pictureHeight = height - 20;
            }
        }
        
        return pictureHeight;
    }
    
    this.getGraphUrlWithSize = function (width, height) {

        if (!params || !params.graphUrl) {
            
            return '';
        }

        var graph            = Piwik.require('PiwikGraph');
        var graphUrlWithSize = graph.appendSize(params.graphUrl, width, height, true);
        graphUrlWithSize     = graph.setParams(graphUrlWithSize, {showMetricTitle: 1, legendAppendMetric: 1});
        graph                = null;
        
        return graphUrlWithSize;
    }
    
    this.getImageView = function (url, width, height) {

        Piwik.getLog().debug('piwik graphUrl is ' + url, 'graph/fulldetail::getImageView');
    
        var options = {width: width,
                       height: height,
                       canScale: !Piwik.getPlatform().isAndroid,
                       hires: !Piwik.getPlatform().isAndroid,
                       defaultImage: '/images/graphDefault.png',
                       enableZoomControls: false,
                       image: url};
                     
        if (Piwik.getPlatform().isAndroid) {
            options.defaultImage = '/images/graphDefault.png';
        }
    
        return Piwik.getUI().createImageView(options);
    }

    var win = this;
    
    var pictureWidth     = this.getPictureWidth();
    var pictureHeight    = this.getPictureHeight();
    var graphUrlWithSize = this.getGraphUrlWithSize(pictureWidth, pictureHeight);
    var imageView        = this.getImageView(graphUrlWithSize, pictureWidth, pictureHeight);
                                          
    if (!Piwik.getPlatform().isIpad) {
             
        function rotateImageOnAndroid (event) {

            if (!imageView || !event || !win) {
                
                return;
            }

            try {
                
                var isLandscape   = Ti.Gesture.isLandscape(event.orientation);
                var pictureWidth  = win.getOrientationSpecificWidth(isLandscape);
                var pictureHeight = win.getOrientationSpecificHeight(isLandscape);
                
                win.remove(imageView);
                imageView = null;
    
                var graphUrlWithSize = win.getGraphUrlWithSize(pictureWidth, pictureHeight);
                imageView            = win.getImageView(graphUrlWithSize, pictureWidth, pictureHeight);
                
                win.add(imageView);
                
            } catch (e) {
                Piwik.getLog().warn('Failed to update (remove and add) graph', 'graph/fulldetail::window');
                Piwik.getLog().warn(e, 'graph/fulldetail::window');
            }
        }
        
        function rotateImage (event) {
            if (!imageView || !win) {
                
                return;
            }
    
            var pictureWidth  = win.getPictureWidth();
            var pictureHeight = win.getPictureHeight();

            imageView.width   = pictureWidth;
            imageView.height  = pictureHeight;

            imageView.image   = win.getGraphUrlWithSize(pictureWidth, pictureHeight);
        }
        
        Ti.Gesture.addEventListener('orientationchange', 
                                    Piwik.getPlatform().isAndroid ? rotateImageOnAndroid : rotateImage);

        win.add(imageView);
        
    } else {

        var quarter   = Math.floor(this.getViewHeight() / 4); // 25%
        var labelView = Ti.UI.createView({className: 'graphiPadDetailLabelContainerView'});
        var topView   = Ti.UI.createImageView({height: quarter, className: 'graphiPadDetailTopContainerView'});
        
        if (params.reportName) {
            labelView.add(Ti.UI.createLabel({text: params.reportName, className: 'graphiPadDetailReportName'}));
        }
        
        if (params.reportDate) {
            labelView.add(Ti.UI.createLabel({text: params.reportDate, className: 'graphiPadDetailReportDate'}));
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
        
    }

    imageView.addEventListener('click', function () {
        if (!win) {
            return;
        }
        
        win.close({opacity: 0, duration: 300});
    });

    win.addEventListener('click', function () {
        if (!win) {
            return;
        }
        
        win.close({opacity: 0, duration: 300});
    });
    
    this.cleanup = function () {

        try {
            if (!Piwik.getPlatform().isIpad) {
                if (imageView) {
                    this.remove(imageView);
                }
                
                Ti.Gesture.removeEventListener('orientationchange', 
                                               Piwik.getPlatform().isAndroid ? rotateImageOnAndroid : rotateImage);
            }
        } catch (e) {
            Piwik.getLog().warn('Failed to remove orientationchange event listener', 'graph/fulldetail::execute');
        }
        
        imageView = null;
        win       = null;
        
        this.menuOptions  = null;
        this.titleOptions = null;
    };
}

module.exports = window;