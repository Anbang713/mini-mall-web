/**
 * Created by cRazy on 2016/9/26.
 */
Ext.define('overrides.window.Toast', {
    override: 'Ext.window.Toast',

    hide: function (animate) {
        var me = this,
            el = me.el;

        if (el && animate === false) {
            me.cancelAutoClose();
            me.callSuper(arguments);
            me.removeFromAnchor();
            me.isHiding = false;
        } else {
            me.callParent(arguments);
        }

        return me;
    }

});