/**
 * Created by cRazy on 2016/10/12.
 */
Ext.define('overrides.panel.Panel', {
    override: 'Ext.panel.Panel',

    requires: [
        'Cxt.panel.MessagePanel'
    ],

    /**
     * @cfg {Boolean/String/Object} messageDock
     * 默认值为false。可以设置为对应的dock，则会产生依靠的messagePanel。
     * 支持Object
     */
    messageDock: false,

    /**
     * @cfg {Boolean} validOnCollapsed
     * 当设置为true的时候，即使是 collapsed 仍进行验证
     */
    validOnCollapsed: false,

    //<locale>
    /**
     * @cfg {String} closeToolText Text to be announced by screen readers when Close tool
     * is focused.
     */
    closeToolText: '关闭',
    //</locale>

    bridgeToolbars: function () {
        var me = this;
        if (me.messageDock) {
            var dockedItems = Ext.Array.from(me.dockedItems);
            me.messagePanel = Ext.widget({
                xtype: 'messagepanel',
                width: '100%',
                dock: me.messageDock,
                autoScroll: true,
                margin: '0 0 10 0'
            });
            dockedItems.push(me.messagePanel);
            me.dockedItems = dockedItems;
        }
        me.callParent(arguments);
        if (me.dockedItems) {
            Ext.Array.sort(me.dockedItems, function (a, b) {
                var as = Ext.valueFrom(a.sequence, -1);
                var bs = Ext.valueFrom(b.sequence, -1);
                if (a.dock == 'bottom' || b.dock == 'bottom') {
                    return bs <= as ? -1 : 1
                } else {
                    return bs <= as ? 1 : -1
                }
            });
        }
    },

    /**
     * Collapses or expands the panel.
     * @param {Boolean} collapsed `true` to collapse the panel, `false` to expand it.
     * @param animate
     */
    setCollapsed: function (collapsed) {
        var me = this;
        if (me.collapsed == collapsed)
            return;

        if (Ext.Component.layoutSuspendCount) {
            me.collapsed = collapsed;
            me[collapsed ? 'beginCollapse' : 'beginExpand']();
            if (me.inheritedState) {
                delete me.inheritedState.collapsed
            }
        } else {
            me[collapsed ? 'collapse' : 'expand']();
        }
    },

    /**
     * @return {String[]} Array of any validation errors
     */
    getErrors: function () {
        var me = this;
        if (me.collapsed && !me.validOnCollapsed) {
            return [];
        }
        return me.callParent(arguments);
    }
});