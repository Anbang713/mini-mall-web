/**
 * Created by cRazy on 2017/10/23.
 */
Ext.define('Cxt.overrides.form.RadioGroup', {
    override: 'Ext.form.RadioGroup',

    requires: [
        'Ext.form.RadioManager'
    ],

    setValue: function (value) {
        var me = this,
            cbValue, first, formId, radios, i, len, name;
        if (Ext.isObject(value)) {
            Ext.suspendLayouts();
            first = this.items.first();
            formId = first ? first.getFormId() : null;
            for (name in value) {
                cbValue = value[name];
                radios = Ext.form.RadioManager.getWithValue(name, cbValue, formId).items;
                len = radios.length;
                for (i = 0; i < len; ++i) {
                    if (radios[i].subgroup && radios[i].subgroup != me.id) {// 对于指定了subgroup的需要匹配
                        continue;
                    }
                    radios[i].setValue(true);
                }
            }
            Ext.resumeLayouts(true);
        }
        return this;
    },

    getValue: function() {
        var me = this;
        var name = me.fieldName;
        var value = me.callParent(arguments);
        if(Ext.isEmpty(Ext.Object.getKeys(value)[0])){
            value[name]   = null;

            return value;
        }
        return value;

    }
});