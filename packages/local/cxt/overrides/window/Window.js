/**
 * Created by cRazy on 2016/10/28.
 */
Ext.define('overrides.window.Window', {
    override: 'Ext.window.Window',

    /**
     * @cfg {String} constrainPosition
     * 设置为'center'则显示的时候默认居中。
     */
    constrainPosition: undefined,

    onResize: function () {
        var me = this;
        me.callParent(arguments);
        if (me.rendered && !me.destroyed && !me.maximized && me.constrainPosition === 'center') {
            me.setPosition((document.body.clientWidth - me.getWidth()) / 2, (document.body.clientHeight - me.getHeight()) / 2);
        }
    }
});