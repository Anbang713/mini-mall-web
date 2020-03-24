/**
 * Created by cRazy on 2017/8/23.
 */
Ext.define('overrides.view.BoundListKeyNav', {
    override: 'Ext.view.BoundListKeyNav',

    onKeyUp: function (e) {
        var me = this,
            boundList = me.view,
            allItems = boundList.all,
            oldItem = boundList.highlightedItem,
            oldItemIdx = oldItem ? boundList.indexOf(oldItem) : -1,
            newItemIdx = oldItemIdx > 0 ? oldItemIdx - 1 : allItems.getCount() - 1;
        //wraps around
        me.setPosition(newItemIdx);
        e.stopEvent();
    },

    onKeyDown: function (e) {
        var me = this,
            boundList = me.view,
            allItems = boundList.all,
            oldItem = boundList.highlightedItem,
            oldItemIdx = oldItem ? boundList.indexOf(oldItem) : -1,
            newItemIdx = oldItemIdx < allItems.getCount() - 1 ? oldItemIdx + 1 : 0;
        //wraps around
        me.setPosition(newItemIdx);
        e.stopEvent();
    }
});