/**
 * Created by cRazy on 2016/9/28.
 */
Ext.define('overrides.layout.component.BoundList', {
    override: 'Ext.layout.component.BoundList',

    beginLayout: function (ownerContext) {
        var me = this,
            owner = me.owner;

        me.callParent(arguments);

        if (owner.fbar) {
            ownerContext.fbarContext = ownerContext.context.getCmp(owner.fbar);
        }
    },

    getLayoutItems: function () {
        var me = this,
            items = [];

        if (me.owner.pagingToolbar) {
            items.push(me.owner.pagingToolbar);
        }
        if (me.owner.fbar) {
            items.push(me.owner.fbar);
        }
        return items;
    },

    publishInnerHeight: function (ownerContext, height) {
        var pagingToolbar = ownerContext.toolbarContext,
            pagingToolbarHeight = 0, fbarHeight = 0;

        if (pagingToolbar) {
            pagingToolbarHeight = pagingToolbar.getProp('height');
        }
        if (ownerContext.fbarContext) {
            fbarHeight = ownerContext.fbarContext.getProp('height');
        }

        if (pagingToolbarHeight === undefined || fbarHeight === undefined) {
            this.done = false;
        } else {
            pagingToolbarHeight = pagingToolbarHeight === undefined ? 0 : pagingToolbarHeight;
            fbarHeight = fbarHeight === undefined ? 0 : fbarHeight;
            ownerContext.listContext.setHeight(height - ownerContext.getFrameInfo().height - pagingToolbarHeight - fbarHeight);
        }
    },

    calculateOwnerHeightFromContentHeight: function (ownerContext) {
        var height = this.callParent(arguments),
            fbar = ownerContext.fbarContext;

        if (fbar) {
            height += fbar.getProp('height');
        }
        return height;
    }
});