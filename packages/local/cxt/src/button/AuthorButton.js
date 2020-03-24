/**
 * 需要授权的按钮。
 *
 * 未授权时，始终不可见
 *
 *     @example
 *     Ext.create({
 *         xtype:'toolbar',
 *         renderTo: Ext.getBody(),
 *         items:[Ext.create('Cxt.button.AuthorButton',{
 *             text: 'Button1',
 *             authorization: false,
 *             handler: function() {
 *                 alert('You clicked the button1!');
 *             }
 *         }),Ext.create('Cxt.button.AuthorButton',{
 *             text: 'Button2',
 *             authorization: true,
 *             handler: function() {
 *                 alert('You clicked the button2!');
 *             }
 *         })]
 *     });
 *
 * Created by cRazy on 2016/7/8.
 */
Ext.define('Cxt.button.AuthorButton', {
    extend: 'Ext.button.Button',
    xtype: 'authorbutton',

    /**
     * @property {Boolean} visible
     * True if this button is visible.
     * 因为增加了authorization 来控制显隐。visible用来记录控件本身设置的hidden
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