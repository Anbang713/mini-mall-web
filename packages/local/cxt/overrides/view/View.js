/**
 * Created by cRazy on 2016/12/21.
 */
Ext.define('overrides.view.View', {
    override: 'Ext.view.View',

    /**
     * @private
     */
    setHighlightedItem: function (item) {
        var me = this;
        if (Ext.isNumber(item)) {
            item = me.all.elements[item] || null;
        }

        me.callParent([item]);
    }
});