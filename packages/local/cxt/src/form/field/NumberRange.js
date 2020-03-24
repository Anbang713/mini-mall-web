/**
 * Created by lzy on 2016/10/14.
 */
Ext.define('Cxt.form.field.NumberRange', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'numberrangefield',

    requires: [
        'Ext.form.field.Display',
        'Ext.form.field.Number',
        'Ext.layout.container.HBox'
    ],

    layout: 'hbox',
    errorPrefixing: true,

    /**是否允许为空，默认为true，表示允许*/
    allowBlank: true,

    config: {
        /**
         * @cfg {number} begin
         * 起始值
         */
        beginValue: undefined,

        /**
         * @cfg {Object[]} end
         * 截止至
         */
        endValue: undefined
    },

    /**
     * @cfg {String} beginParam
     */
    beginParam: 'beginValue',

    /**
     * @cfg {String} endParam
     */
    endParam: 'endValue',

    /**
     * @cfg {Object} beginConfig
     * 起始配置
     */
    beginConfig: undefined,

    /**
     * @cfg {Object} endConfig
     * 截止配置
     */
    endConfig: undefined,


    /**
     * @private
     */
    initComponent: function () {
        var me = this;

        me.beginValueField = Ext.create(Ext.apply({
            xtype: 'numberfield',
            flex: 1,
            readOnly: me.readOnly,
            fieldCaption: me.fieldLabel + '起始',
            allowBlank: me.allowBlank
        }, me.beginConfig));
        me.dateSeparator = Ext.create({
            xtype: 'displayfield',
            value: '&nbsp;至&nbsp;',
            showTip: false
        });
        me.endValueField = Ext.create(Ext.apply({
            xtype: 'numberfield',
            flex: 1,
            readOnly: me.readOnly,
            fieldCaption: me.fieldLabel + '截止',
            allowBlank: me.allowBlank
        }, me.endConfig));

        Ext.apply(me, {
            items: [me.beginValueField, me.dateSeparator, me.endValueField]
        });

        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.beginFieldListeners = me.beginValueField.on({
            destroyable: true,
            change: function (field, newValue, oldValue) {
                me.updateBeginValue(newValue);
            },
            blur: function () {
                me.fireEvent('blur', me);
            }
        });

        me.endFieldListeners = me.endValueField.on({
            destroyable: true,
            change: function (field, newValue, oldValue) {
                me.updateEndValue(newValue, oldValue);
            },
            blur: function () {
                me.fireEvent('blur', me);
            }
        });

        me.setValue(me.getValue());
    },

    /**
     * Returns the raw String value of the field,
     */
    getRawValue: function () {
        var me = this;
        return me.valueToRaw(me.getValue());
    },

    /**
     * Sets the field's raw value directly
     */
    setRawValue: function (rawValue) {
        var me = this;
        rawValue = Ext.valueFrom(rawValue, '');

        if (rawValue == me.getRawValue())
            return;

        me.setValue(me.rawToValue(rawValue));

        if (me.rendered && me.reference) {
            me.publishState('rawValue', rawValue);
        }
        return rawValue;
    },

    getValue: function () {
        var me = this,
            value = {};

        if (!me.rendered)
            return;

        value[me.beginParam] = me.beginValueField.getValue();
        value[me.endParam] = me.endValueField.getValue();
        return value;
    },

    setValue: function (value, suspendEvent) {
        var me = this;
        if (value == undefined || value == null) {
            return me.clearValue();
        }
        value = Ext.valueFrom(value, {});
        if (suspendEvent === true) {
            me.suspendEvent('change');
            me.setBeginValue(value[me.beginParam]);
            me.setEndValue(value[me.endParam]);
            me.resumeEvent('change');
        } else {
            me.setBeginValue(value[me.beginParam]);
            me.setEndValue(value[me.endParam]);
        }
    },

    clearValue: function () {
        var me = this;
        me.beginValueField.setValue();
        me.endValueField.setValue();
        if (me.rendered) {
            me.endValueField.setMinValue();
            me.endValueField.setMaxValue();
        }
    },

    setBeginValue: function (beginValue) {
        var me = this,
            field = me.beginValueField;

        if (!me.rendered || beginValue == field.getValue())
            return;

        field.setValue(beginValue);
        me.updateBeginValue(beginValue);
    },

    updateBeginValue: function (newValue, oldValue) {
        var me = this,
            value = Ext.valueFrom(me.getValue(), {});

        value[me.beginParam] = newValue;
        if (me.rendered) {
            me.endValueField.setMinValue(newValue);

            me.fireEvent('beginchange', me.beginValueField, newValue, oldValue);
            me.fireEvent('change', me, me.getValue());

            me.publishState('beginValue', newValue);
            me.publishState('value', value);
        }
    },

    setEndValue: function (endValue) {
        var me = this,
            field = me.endValueField;

        if (!me.rendered || endValue == field.getValue())
            return;

        field.setValue(endValue);
        me.updateEndValue(endValue);
    },

    updateEndValue: function (newValue, oldValue) {
        var me = this,
            value = Ext.valueFrom(me.getValue(), {});

        value[me.endParam] = newValue;
        if (me.rendered) {
            me.fireEvent('endchange', me.endValueField, newValue, oldValue);
            me.fireEvent('change', me, me.getValue());

            me.publishState('endValue', newValue);
            me.publishState('value', value);
        }
    },

    valueToRaw: function (value) {
        var rawValue = "";
        if (value.beginValue == undefined && value.endValue == undefined)
            return rawValue;

        value = Ext.valueFrom(value, {});
        if (value.beginValue != undefined) {
            rawValue += value.beginValue;
        }
        rawValue += '～';
        if (value.endValue != undefined) {
            rawValue += value.endValue;
        }
        return rawValue;
    },

    rawToValue: function (rawValue) {
        var me = this;
        var value = {}, list;
        rawValue = Ext.valueFrom(rawValue, '');
        list = rawValue.split('～');

        value[me.beginParam] = list[0];
        value[me.endParam] = list[1];
        return value;
    },

    /**
     * @private
     * @inheritdoc
     */
    beforeDestroy: function () {
        var me = this;

        if (me.rendered) {
            delete me.beginConfig;
            Ext.destroy(
                me.beginValueField,
                me.beginFieldListeners,
                me.dateSeparator,
                me.endValueField,
                me.endFieldListeners
            );
            delete me.endConfig;
        }
        me.callParent(arguments);
    }
});