/**
 * 日期范围控件
 * Created by cRazy on 2016/8/26.
 */
Ext.define('Cxt.form.field.YearMonthRange', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'monthrangefield',

    requires: [
        'Cxt.form.field.YearMonth',
        'Ext.form.field.Display',
        'Ext.layout.container.HBox'
    ],

    layout: 'hbox',
    errorPrefixing: true,

    intervalLimit: undefined,
    intervalLimitType: Ext.Date.MONTH,

    /**起止日期是否允许为空，默认为true，表示允许*/
    allowBlank: true,

    config: {

        /**
         * @cfg {Date} beginValue
         * 起始日期
         */
        beginValue: undefined,

        /**
         * @cfg {Date} endValue
         * 截止日期
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
     * 起始日期的绑定
     */

    /**
     * @cfg {Object} endConfig
     * 截止日期的绑定
     */


    /**
     * @cfg {boolean} changeConfirm
     * 修改前是否进行确认
     */
    changeConfirm: false,
    changeConfirmText: '是否确定修改？',

    /**
     * @private
     */
    initComponent: function () {
        var me = this;

        me.beginValueField = Ext.create(Ext.apply({
            xtype: 'monthfield',
            flex: 1,
            fieldCaption: me.fieldLabel + '起始',
            allowBlank: me.allowBlank,
            changeConfirm: me.changeConfirm,
            changeConfirmText: me.changeConfirmText
        }, me.beginConfig));
        me.dateSeparator = Ext.create({
            xtype: 'displayfield',
            value: '&nbsp;至&nbsp;',
            showTip: false
        });
        me.endValueField = Ext.create(Ext.apply({
            xtype: 'monthfield',
            flex: 1,
            fieldCaption: me.fieldLabel + '截止',
            allowBlank: me.allowBlank,
            changeConfirm: me.changeConfirm,
            changeConfirmText: me.changeConfirmText
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
            select: function (field, newValue, oldValue) {
                me.updateBeginValue(newValue, oldValue);
            },
            blur: function () {
                me.fireEvent('blur', me);
            }
        });

        me.endFieldListeners = me.endValueField.on({
            destroyable: true,
            select: function (field, newValue, oldValue) {
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

    setValue: function (value) {
        var me = this;
        value = Ext.valueFrom(value, {});
        me.setBeginValue(value[me.beginParam]);
        me.setEndValue(value[me.endParam]);
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
            if (me.intervalLimit > 0) {
                var date = Ext.Date.truncate(Ext.Date.parse(newValue, 'Ym'), Ext.Date.MONTH);
                me.endValueField.setMaxValue(Ext.Date.add(Ext.Date.add(date, me.intervalLimitType, me.intervalLimit), Ext.Date.DAY, -1));
            }

            me.fireEvent('beginchange', me.beginValueField, newValue, oldValue);
            me.fireEvent('change', me, value);

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
            me.fireEvent('change', me, value);

            me.publishState('endValue', newValue);
            me.publishState('value', value);
        }
    },

    valueToRaw: function (value) {
        var rawValue = "";
        if (!value.beginValue && !value.endValue)
            return rawValue;

        value = Ext.valueFrom(value, {});
        if (value.beginValue) {
            rawValue += value.beginValue;
        }
        rawValue += '～';
        if (value.endValue) {
            rawValue += value.endValue;
        }
        return rawValue;
    },

    rawToValue: function (rawValue) {
        var me = this,
            dates, value = {};
        rawValue = Ext.valueFrom(rawValue, '');
        dates = rawValue.split('～');

        value[me.beginParam] = me.beginValueField.parseDate(dates[0]);
        value[me.endParam] = me.endValueField.parseDate(dates[1]);
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