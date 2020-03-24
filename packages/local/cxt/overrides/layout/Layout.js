/**
 * Created by cRazy on 2016/9/22.
 */
Ext.define('overrides.layout.Layout', {
    override: 'Ext.layout.Layout',

    /**
     * For a given item, returns the element that participates in the childNodes array
     * of the layout's target element.  This is usually the component's "el", but can
     * also be a wrapper
     * @private
     * @param {Ext.Component} item
     * @return {HTMLElement}
     */
    getItemLayoutEl: function (item) {
        var dom = item.el && item.el.dom ? item.el.dom : Ext.getDom(item),
            parentNode = dom.parentNode,
            className;
        if (parentNode) {
            className = parentNode.className;
            if (className && className.indexOf(Ext.baseCSSPrefix + 'resizable-wrap') !== -1) {
                dom = dom.parentNode;
            }
        }
        return dom;
    }
});