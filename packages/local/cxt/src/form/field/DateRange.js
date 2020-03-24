/**
 * 日期范围控件
 * Created by cRazy on 2016/8/26.
 */
Ext.define('Cxt.form.field.DateRange', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'daterangefield',

    requires: [
        'Ext.form.field.Date',
        'Ext.form.field.Display',
        'Ext.layout.container.HBox'
    ],

    layout: 'hbox',
    errorPrefixing: true,

    intervalLimit: undefined,
    intervalLimitType: Ext.Date.MONTH,

    /**起止日期是否允许为空，默认为true，表示允许*/
    allowBlank: true,

    /**自定义起止时间可选值关联*/
    beginDateAndEndDateRelation: false,

    /**最小起始时间*/
    minBeginDate: undefined,
    /**最大起始时间*/
    maxBeginDate: undefined,
    /**最小截止时间*/
    minEndDate: undefined,
    /**最大截止时间*/
    maxEndDate: undefined,

    /** readOnly */
    readOnly: false,

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
    beginParam: 'beginDate',

    /**
     * @cfg {String} endParam
     */
    endParam: 'endDate',

    /**
     * @cfg {Object} beginConfig
     * 起始日期的绑定
     */

    /**
     * @cfg {Object} endConfig
     * 截止日期的绑定
     */

    /**
     * @private
     */
    initComponent: function () {
        var me = this;

        me.beginValueField = Ext.widget(Ext.apply({
            xtype: 'datefield',
            flex: 1,
            fieldCaption: me.fieldLabel + '起始',
            allowBlank: me.allowBlank,
            readOnly: me.readOnly
        }, me.beginConfig));
        me.dateSeparator = Ext.widget({
            xtype: 'displayfield',
            value: '&nbsp;至&nbsp;',
            showTip: false
        });
        me.endValueField = Ext.widget(Ext.apply({
            xtype: 'datefield',
            flex: 1,
            fieldCaption: me.fieldLabel + '截止',
            allowBlank: me.allowBlank,
            readOnly: me.readOnly
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
                me.updateBeginValue(newValue, oldValue);
            },
            blur: function () {
                me.fireEvent('blur', me);
            }
        });

        me.endFieldListeners = me.endValueField.on({
            destroyable: true,
            change: function (field, newValue, oldValue) {
                me.updateEndValue(newValue, oldValue);
                me.fireEvent('endchange', field, newValue, oldValue);
                me.fireEvent('change', me, me.getValue());
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

        value[me.beginParam] = Ext.Date.parse(me.beginValueField.getValue());
        value[me.endParam] = Ext.Date.parse(me.endValueField.getValue());
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
        if (me.beginDateAndEndDateRelation) {
            if (Ext.isEmpty(me.endValueField.minValue) && !Ext.isEmpty(me.minEndDate)) {
                me.endValueField.setMinValue(me.minEndDate);
            }
            if (Ext.isEmpty(me.endValueField.maxValue) && !Ext.isEmpty(me.maxEndDate)) {
                me.endValueField.setMaxValue(me.maxEndDate);
            }
        }
    },

    setBeginValue: function (beginValue) {
        var me = this,
            field = me.beginValueField;

        beginValue = Ext.Date.parse(beginValue);
        if (!me.rendered
            || field.formatDate(beginValue) == field.formatDate(field.getValue())
            || beginValue == Ext.Date.parse(field.getValue()))
            return;

        field.setValue(beginValue);
        me.updateBeginValue(beginValue);
    },

    updateBeginValue: function (newValue, oldValue) {
        var me = this,
            value = Ext.valueFrom(me.getValue(), {});

        newValue = Ext.Date.parse(newValue);
        value[me.beginParam] = newValue;

        if (me.rendered) {
            if (me.endConfig && me.endConfig.minValue) {
                var minEndDate = Ext.Date.parse(me.endConfig.minValue);
                me.endValueField.setMinValue(minEndDate && minEndDate > newValue ? minEndDate : newValue);
            } else {
                me.endValueField.setMinValue(newValue);
            }
            if (me.intervalLimit > 0) {
                var maxValue = newValue;
                if (maxValue) {
                    if (maxValue.getDate() > 1) {
                        maxValue = Ext.Date.add(maxValue, Ext.Date.DAY, -1);
                        maxValue = Ext.Date.add(maxValue, me.intervalLimitType, me.intervalLimit);
                    } else {
                        maxValue = Ext.Date.add(maxValue, me.intervalLimitType, me.intervalLimit);
                        maxValue = Ext.Date.add(maxValue, Ext.Date.DAY, -1);
                    }
                    me.endValueField.setMaxValue(maxValue);
                }
            }
            me.fireEvent('beginchange', me.beginValueField, newValue, oldValue);
            me.fireEvent('change', me, me.getValue());

            me.publishState('beginValue', newValue);
            me.publishState('value', value);
            if (me.beginDateAndEndDateRelation) {
                if (Ext.isEmpty(me.endValueField.minValue) && !Ext.isEmpty(me.minEndDate)) {
                    me.endValueField.setMinValue(me.minEndDate);
                }
                if (Ext.isEmpty(me.endValueField.maxValue) && !Ext.isEmpty(me.maxEndDate)) {
                    me.endValueField.setMaxValue(me.maxEndDate);
                }
            }
        }
    },

    setEndValue: function (endValue) {
        var me = this,
            field = me.endValueField;

        endValue = Ext.Date.parse(endValue);
        if (!me.rendered
            || field.formatDate(endValue) == field.formatDate(field.getValue())
            || endValue == Ext.Date.parse(field.getValue()))
            return;

        field.setValue(endValue);
        me.updateEndValue(endValue);
    },

    updateEndValue: function (newValue, oldValue) {
        var me = this,
            value = Ext.valueFrom(me.getValue(), {});

        newValue = Ext.Date.parse(newValue);
        value[me.endParam] = newValue;
        if (me.rendered) {
            me.beginValueField.setMaxValue(newValue);
            me.fireEvent('endchange', me.endValueField, newValue, oldValue);
            me.fireEvent('change', me, me.getValue());

            me.publishState('endValue', newValue);
            me.publishState('value', value);
            if (me.beginDateAndEndDateRelation) {
                if (Ext.isEmpty(me.beginValueField.minValue) && !Ext.isEmpty(me.minBeginDate)) {
                    me.beginValueField.setMinValue(me.minBeginDate);
                }
                if (Ext.isEmpty(me.beginValueField.maxValue) && !Ext.isEmpty(me.maxBeginDate)) {
                    me.beginValueField.setMaxValue(me.maxBeginDate);
                }
            }
        }
    },

    valueToRaw: function (value) {
        var me = this,
            rawValue = "";
        if (!value[me.beginParam] && !value[me.endParam])
            return rawValue;

        value = Ext.valueFrom(value, {});
        if (value[me.beginParam]) {
            rawValue += me.beginValueField.formatDate(value[me.beginParam]);
        }
        rawValue += '～';
        if (value[me.endParam]) {
            rawValue += me.endValueField.formatDate(value[me.endParam]);
        }
        return rawValue;
    },

    rawToValue: function (rawValue) {
        var me = this,
            value = {}, dates;
        rawValue = Ext.valueFrom(rawValue, '');
        dates = rawValue.split('～');

        value[me.beginParam] = me.beginValueField.parseDate(dates[0]);
        value[me.endParam] = me.endValueField.parseDate(dates[1]);
        return value;
    },

    setReadOnly: function (readOnly) {
        var me = this;
        me.readOnly = readOnly;
        me.beginValueField.setReadOnly(readOnly);
        me.endValueField.setReadOnly(readOnly);
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