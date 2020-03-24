/**
 * 需要授权的菜单按钮。
 * 未授权时，始终不可见
 * Created by cRazy on 2016/7/8.
 */
Ext.define('Cxt.menu.AuthorItem', {
    extend: 'Ext.menu.Item',
    xtype: 'authormenuitem',

    /**
     * @property {Boolean} visible
     * True if this button is visible.
     * @readonly
     */
    visible: true,
    /**
     * @cfg {Boolean} authorization
     * 授权许可。只有授权了之后，才允许显示。
     */
    authorization: false,

    initComponent: function () {
        var me = this;
        me.visible = !me.hidden;// 默认的可见状态。
        me.callParent(arguments);

        me.setAuthorization(me.getAuthorization());//默认的按钮授权状态
    },

    show: function (animateTarget, cb, scope) {
        var me = this;
        me.visible = true;

        if (!me.authorization) {//未授权时，直接返回，不允许显示。
            return;
        }

        return me.callParent(arguments);
    },

    hide: function (animateTarget, cb, scope) {
        var me = this;
        me.visible = false;

        return me.callParent(arguments);
    },
    /**
     * Returns `true` if this component is authorization.
     */
    getAuthorization: function () {
        var me = this;
        return me.authorization;
    },

    /**
     * @param {Boolean} authorization `true` to authorization, `false` to reject.
     */
    setAuthorization: function (authorization) {
        var me = this;
        me.authorization = authorization;
        if (!authorization) {
            var visible = me.visible;
            me.hide();
            return me.visible = visible;// 授权的隐藏，不应该对visible有影响
        }
        if (me.visible) {// visible时则显示。
            me.show();
        }
    }
});