/**
 * Created by cRazy on 2017/1/13.
 */
Ext.define('overrides.form.Labelable', {
    override: 'Ext.form.Labelable',

    beforeLabelRender: function () {
        var me = this;
        me.setFieldDefaults(me.getInherited().fieldDefaults);
        if (me.ownerCt && me.ownerCt.itemDefaults) {
            me.setFieldDefaults(me.ownerCt.itemDefaults);
        }
        if (me.ownerLayout) {
            me.addCls(Ext.baseCSSPrefix + me.ownerLayout.type + '-form-item');
        }
        if (!me.hasVisibleLabel()) {
            me.addCls(me.noLabelCls);
        }
    }
});