/**
 * Created by cRazy on 2016/9/28.
 */
Ext.define('overrides.form.field.Radio', {
    override: 'Ext.form.field.Radio',

    /**
     * @private Handle click on the radio button
     */
    onBoxClick: function () {
        var me = this;
        if (!me.disabled && !me.readOnly) {
            if (me.ownerCt && me.ownerCt.allowBlank === false && me.getValue())
                return;
            this.setValue(!me.getValue());
        }
    },

    onChange: function (newVal, oldVal) {
        var me = this,
            r, rLen, radio, radios;
        me.callSuper(arguments);
        if (newVal) {
            radios = me.getManager().getByName(me.name, me.getFormId()).items;
            rLen = radios.length;
            for (r = 0; r < rLen; r++) {
                radio = radios[r];
                if (radio !== me && radio.subgroup === me.subgroup) {
                    radio.setValue(false);
                }
            }
        }
    }
});