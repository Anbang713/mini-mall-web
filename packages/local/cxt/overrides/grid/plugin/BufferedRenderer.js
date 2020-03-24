/**
 * Created by cRazy on 2016/12/15.
 */
Ext.define('overrides.grid.plugin.BufferedRenderer', {
    override: 'Ext.grid.plugin.BufferedRenderer',

    // Disable handling of scroll events until the load is finished
    onBeforeStoreLoad: function (store) {
        var me = this,
            view = me.view;
        if (view && view.refreshCounter) {
            // Unless we are loading tree nodes, or have preserveScrollOnReload, set scroll position and row range back to zero.
            if (store.isTreeStore || view.preserveScrollOnReload) {
                me.nextRefreshStartIndex = view.all.startIndex;
            } else {
                if (me.scrollTop !== 0 && me.grid.scrollTopOnLoad) {
                    // Zero position tracker so that next scroll event will not trigger any action
                    me.setBodyTop(me.bodyTop = me.scrollTop = me.position = me.scrollHeight = me.nextRefreshStartIndex = 0);
                    view.setScrollY(0);
                }
            }
            me.lastScrollDirection = me.scrollOffset = null;
            // MUST delete, not null out because the calculation checks hasOwnProperty.
            // Unless we have a configured rowHeight
            if (!view.hasOwnProperty('rowHeight')) {
                delete me.rowHeight;
            }
        }
        me.disable();
    }
});