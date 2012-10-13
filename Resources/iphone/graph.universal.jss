/*
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

.noDataForGraphTableViewRow {
    height: 40;
    left: 10;
    color: '#333333';
    font-size: 12;
    right: 10;
    /** Ti.UI.iPhone.TableViewCellSelectionStyle.NONE **/
    selectionStyle: 0;
}

.graphTableViewRow {
    height: 181;
    backgroundColor: '#ffffff';
    /** Ti.UI.iPhone.TableViewCellSelectionStyle.NONE **/
    selectionStyle: 0;
}

.graphShowDetailImage {
    image: 'images/ic_action_search.png';
    backgroundSelectedColor: '#FFC700';
    backgroundFocusedColor: '#FFC700';
    backgroundColor: '#ffffff';
    focusable: true;
    bottom: 8;
    right: 8;
    width: 32;
    height: 32;
    zIndex: 2;
}

#graphImage {
    top: 12;
    left: 10;
    zIndex: 1;
}

.graphiPadDetailReportName {
    ellipsize: true;
    wordWrap: false;
    color: '#333333';
    textAlign: 'center';
    left: 20;
    right: 20;
    font-size: 48;
}

.graphiPadDetailReportDate {
    ellipsize: true;
    wordWrap: false;
    textAlign: 'center';
    top: 25;
    left: 20;
    right: 20;
    color: '#666666';
    font-size: 36;
}

.graphiPadDetailTopContainerView {
    top: 0;
    left: 0;
    right: 0;
    backgroundColor: '#cccccc';
}

.graphiPadDetailLabelContainerView {
    layout: 'vertical';
    height: 'SIZE';
    width: 'SIZE';
    left: 0;
    right: 0;
}

.graphiPadDetailTopViewSeparator {
    bottom: 0;
    height: 2;
    backgroundColor: '#bbbbbb';
    left: 0;
    right: 0;
}

.graphiPadDetailBottomContainerView {
    bottom: 0;
    left: 0;
    right: 0;
}
