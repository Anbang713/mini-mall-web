/**
 * 允许提交中断
 * Created by cRazy on 2016-8-9-0009.
 */
Ext.define('overrides.form.trigger.Trigger', {
    override: 'Ext.form.trigger.Trigger',

    hide: function () {
        var me = this,
            el = me.el;
        me.hidden = true;
        if (el && el.dom) {
            el.hide();
        }
    }
});