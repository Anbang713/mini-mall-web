/**
 * Created by cRazy on 2016/10/14.
 */
Ext.define('overrides.menu.Item', {
    override: 'Ext.menu.Item',

    onClick: function (e) {
        var me = this, ownerCmp,
            item = me;
        if (me.disabled)
            return;
        while (item.parentMenu && !me.menu) {
            if (!item.parentMenu)break;
            item.parentMenu.blur();

            ownerCmp = item.parentMenu.ownerCmp;
            if (!ownerCmp)
                break;

            ownerCmp.fireEvent('itemclick', ownerCmp, me);
            if (Ext.isFunction(ownerCmp.doHideMenu)) {
                item.blur();
                ownerCmp.doHideMenu();
            }
            item = ownerCmp;
        }

        me.callParent(arguments);
        me.expandMenu(e);
    },

    show: function () {
        var me = this,
            owner = me.up();
        me.callParent(arguments);
        if (owner && Ext.isFunction(owner.minimizeSeparators)) {
            owner.minimizeSeparators();
        }
    },

    hide: function () {
        var me = this,
            owner = me.up();
        me.callParent(arguments);

        if (owner && Ext.isFunction(owner.minimizeSeparators)) {
            owner.minimizeSeparators();
        }
    }
});