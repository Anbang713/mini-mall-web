/**
 * Created by cRazy on 2017/3/15.
 */
Ext.define('overrides.fx.target.Element', {
    override: 'Ext.fx.target.Element',

    setElVal: function (element, attr, value) {
        if (!element.dom) {
            return;// element可能被销毁了。
        }
        if (attr === 'x') {
            element.setX(value);
        } else if (attr === 'y') {
            element.setY(value);
        } else if (attr === 'scrollTop') {
            element.scrollTo('top', value);
        } else if (attr === 'scrollLeft') {
            element.scrollTo('left', value);
        } else if (attr === 'width') {
            element.setWidth(value);
        } else if (attr === 'height') {
            element.setHeight(value);
        } else {
            element.setStyle(attr, value);
        }
    }
});