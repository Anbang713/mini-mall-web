/**
 * 年月选择框
 * Created by cRazy on 2016/9/20.
 */
Ext.define('Cxt.form.field.YearMonth', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.monthfield',

    requires: [
        'Ext.form.field.Picker',
        'Ext.picker.Month',
        'Ext.util.Format'
    ],

    triggers: {
        clear: {
            id: 'clear',
            cls: 'fa fa-times-circle',
            weight: -1,
            handler: 'clearValue',
            scope: 'this'
        },
        picker: {
            cls: Ext.baseCSSPrefix + 'form-date-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },

    config: {

        /**
         * @cfg {boolean} maxEquals
         * 针对于maxValue的补充限定，是否允许等于最大日期。
         */
        maxEquals: true,

        /**
         * @cfg {boolean} minEquals
         * 针对于minValue的补充限定，是否允许等于最小日期。
         */
        minEquals: true,

        /**
         * @cfg {boolean} monthSelectable
         * 月份选择
         *
         */
        monthSelectable: true,

        /**
         * @cfg {String} month
         * 月份
         */
        month: undefined,

        /**
         * @cfg {String} year
         * 年份
         */
        year: undefined,

        activeNewYear: undefined,
        yearNewOffset: 6,
        //设置默认显示月份
        defultMonth:undefined

    },

    minText: "该输入项必须大于 {0}",
    maxText: "该输入项必须小于 {0}",

    minEqualsText: "该输入项必须大于等于 {0}",
    maxEqualsText: "该输入项必须小于等于 {0}",

    /**
     * @cfg {String} value
     * 年月
     */

    /**
     * @cfg {String} rawValue
     * 显示文本
     */

    /**
     * @cfg {String} formatTpl
     * 显示格式，
     */

    /**
     * @cfg {String} clearable
     * 可清空，
     */

    /**
     * @cfg {Date/String} minValue
     * The minimum allowed date. Can be either a Javascript date object or a string date in a valid format.
     */
    /**
     * @cfg {Date/String} maxValue
     * The maximum allowed date. Can be either a Javascript date object or a string date in a valid format.
     */

    /**
     * @cfg {String} [triggerCls='x-form-date-trigger']
     * An additional CSS class used to style the trigger button. The trigger will always get the class 'x-form-trigger'
     * and triggerCls will be **appended** if specified (default class displays a calendar icon).
     */
    triggerCls: Ext.baseCSSPrefix + 'form-date-trigger',

    matchFieldWidth: false,
    editable: false,

    /**
     * @cfg {boolean} changeConfirm
     * 修改前是否进行确认
     */
    changeConfirm: false,
    changeConfirmText: '是否确定修改？',

    initComponent: function () {
        var me = this;
        me.setMinValue(me.minValue, me.minEquals);
        me.setMaxValue(me.maxValue, me.maxEquals);
        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.getTrigger('clear').setVisible(false);
        if (!me.monthSelectable) {
            me.setMonthSelectable(me.monthSelectable);
        }
    },

    createPicker: function () {
        var me = this,
            picker;

        // Create floating Picker BoundList. It will acquire a floatParent by looking up
        // its ancestor hierarchy (Pickers use their pickerField property as an upward link)
        // for a floating component.
        picker = Ext.widget({
            xtype: 'monthpicker',
            // We need to set the ownerCmp so that owns() can correctly
            // match up the component hierarchy so that focus does not leave
            // an owning picker field if/when this gets focus.
            ownerCmp: me,
            floating: true,
            padding: me.padding,
            shadow: false,
            activeNewYear: me.activeNewYear,
            yearNewOffset: me.yearNewOffset,
            monthSelectable: me.monthSelectable,
            defultMonth:me.defultMonth,
            listeners: {
                cancelclick: me.onCancelClick,
                okclick: me.onOkClick,
                yeardblclick: me.onOkClick,
                monthdblclick: me.onOkClick,
                scope: me
            }
        });

        return picker;
    },

    onExpand: function () {
        var me = this,
            value;
        if (me.getValue()) {
            value = me.safeParse(me.getValue());
        } else {
            value = new Date();
            if (me.minValue && value < me.minValue) {
                value = me.minValue;
                if (me.minEquals === false) {
                    value = Ext.Date.add(value, Ext.Date.MONTH, 1);
                }
            } else if (me.maxValue && value > me.maxValue) {
                value = me.maxValue;
                if (me.maxEquals === false) {
                    value = Ext.Date.add(value, Ext.Date.MONTH, -1);
                }
            }
        }
        me.getPicker().setMinValue(me.minValue, me.minEquals);
        me.getPicker().setMaxValue(me.maxValue, me.maxEquals);

        me.getPicker().setValue(value);
    },

    // When focus leaves the picker component, if it's to outside of this
    // Component's hierarchy
    onFocusLeave: function (e) {
        var me = this;
        // me.callParent(arguments); // 取消动作，使下拉不收回
    },

    /**
     * 返回值为空时，不触发change事件，原因未知。当前值为空或者为正确格式的值时触发doChange，相当于change事件。
     * @returns {*}
     */
    getValue: function () {
        var me = this,
            value = null;
        if (me.editable == false) {//为避免出错兼容历史使用情况，实际上可以直接返回me.callParent(arguments);
            var year = me.year ? me.year : '',
                month = me.month ? me.month : '';
            value = year + '' + month;
            if (me.rendered && (Ext.isEmpty(value) || Ext.isEmpty(me.safeParse(value)) == false)) {
                me.fireEvent('doChange', me, value);
            }
            return value;
        }
        value = me.callParent(arguments);
        if (me.rendered && (Ext.isEmpty(value) || Ext.isEmpty(me.safeParse(value)) == false)) {
            me.fireEvent('doChange', me, value);
        }
        return value;
    },

    /**
     * Sets a data value into the field and runs the change detection and validation. Also applies any configured
     * {@link #emptyText} for text fields. To set the value directly without these inspections see {@link #setRawValue}.
     * @param value
     *  设置为日期或者格式文本
     * @return {Ext.form.field.Text} this
     */
    setValue: function (value) {
        var me = this;

        try {
            var date = me.safeParse(value);
            me.year = Ext.util.Format.date(date, 'Y');
            if(me.monthSelectable){
                me.month = Ext.util.Format.date(date, 'm');
            }
        } catch (e) {
        }
        me.refreshDisplay(value);
        me.validate();
    },

    setRawValue: function (value) {
        var me = this;
        if (me.clearable) {
            me.getTrigger('clear').setVisible(value);
        }
        me.callParent(arguments);
    },

    clearValue: function () {
        var me = this,
            changeConfirm = me.changeConfirm,
            changeConfirmText = me.changeConfirmText,
            fn = function () {
                me.setValue();
                if (me.rendered) {
                    me.publishState('year', undefined);
                    me.publishState('month', undefined);
                    me.publishState('value', undefined);
                    me.fireEvent('select', me);
                }
            };

        if (Ext.isFunction(changeConfirm)) {
            changeConfirm = changeConfirm();
        }

        if (!changeConfirm) {
            return fn();
        }
        Ext.Msg.confirm("提示", changeConfirmText, function (success) {
            if (success == 'yes') {
                return fn();
            }
        });
    },

    setYear: function (year) {
        var me = this;
        if (me.year == year)
            return;

        me.year = year;
        me.refreshDisplay();
        if (me.rendered && !me.getErrors().length) {
            me.publishState('year', year);
        }
    },

    setMonth: function (month) {
        var me = this;
        if (me.month == month)
            return;

        me.month = month;
        if (me.month) {// 月份补零
            me.month = Ext.String.leftPad(me.month, 2, '0');
        }
        me.refreshDisplay();
        if (me.rendered && !me.getErrors().length) {
            me.publishState('month', month);
        }
    },

    /**
     * 最小值为1000年01月
     * @param minValue
     * @param minEquals
     */
    setMinValue: function (minValue, minEquals) {
        var me = this,
            minVal = me.monthSelectable ? '100001' : '1000',
            format = me.monthSelectable ? 'Ym' : 'Y',
            minDate = Ext.Date.truncate(Ext.Date.parse(minVal, format), Ext.Date.MONTH);

        if (minEquals === true || minEquals === false) {
            me.minEquals = minEquals;
        }
        if (Ext.isEmpty(minValue)) {
            minValue = minVal;
        }
        me.minValue = me.safeParse(minValue);
        if (me.minValue < minDate) {
            me.minValue = minDate;
        }
        if (me.getRawValue()) {
            me.validate();
        }
    },

    /**
     * 最大值为9999年12月
     * @param maxValue
     * @param maxEquals
     */
    setMaxValue: function (maxValue, maxEquals) {
        var me = this,
            maxVal = me.monthSelectable ? '999912' : '9999',
            format = me.monthSelectable ? 'Ym' : 'Y',
            maxDate = Ext.Date.truncate(Ext.Date.parse(maxVal, format), Ext.Date.MONTH);
        if (maxEquals === true || maxEquals === false) {
            me.maxEquals = maxEquals;
        }
        if (Ext.isEmpty(maxValue)) {
            maxValue = maxVal;
        }
        me.maxValue = me.safeParse(maxValue);
        if (me.maxValue > maxDate) {
            me.maxValue = maxDate;
        }
        if (me.getRawValue()) {
            me.validate();
        }
    },

    setMonthSelectable: function (monthSelectable) {
        var me = this;
        if (me.monthSelectable == monthSelectable)
            return;

        me.monthSelectable = monthSelectable;

        if (me.formatTpl) {
            me.formatTpl.destroy();
            delete me.formatTpl;
        }
        if (me.getValue()) {
            me.refreshDisplay();
        }
        if (me.rendered && me.picker) {
            me.picker.destroy();
            delete me.picker;
        }
    },
    /**
     * Respond to an ok click on the month picker
     * @private
     */
    onOkClick: function (picker, value) {
        var me = this,
            changeConfirm = me.changeConfirm,
            changeConfirmText = me.changeConfirmText;

        if (Ext.isFunction(changeConfirm)) {
            changeConfirm = changeConfirm();
        }

        if (!changeConfirm) {
            return me.doSelect(value);
        }
        Ext.Msg.confirm("提示", changeConfirmText, function (success) {
            if (success == 'yes') {
                me.doSelect(value);
            }
        });
    },

    doSelect: function (value) {
        var me = this,
            oldValue = me.getValue();
        me.setMonth(value[0] + 1);
        me.setYear(value[1]);
        me.validate();
        if (me.rendered && !me.getErrors().length) {
            me.publishState('value', me.getValue());
        }
        me.fireEvent('select', me, me.getValue(), oldValue);
        me.collapse();
        me.focus();
    },

    /**
     *  刷新显示文本
     */
    refreshDisplay: function (value) {
        var me = this,
            rawValue = me.getFormatTpl().apply({
                year: me.year,
                month: me.month
            });
        if (!me.year && !me.month) {
            rawValue = Ext.isEmpty(value) ? '' : value;
        }
        me.setRawValue(rawValue);
        if (me.rendered && !me.getErrors().length) {
            me.publishState('rawValue', rawValue);
        }
    },

    getFormatTpl: function () {
        var me = this;

        if (!me.formatTpl) {
            if (!me.monthSelectable) {
                me.formatTpl = '{year}';
            } else {
                me.formatTpl = [
                    '<tpl if="this.isValid(year)">',
                    '{year}',
                    '</tpl>',
                    '<tpl if="this.isValid(month)">',
                    '{month}',
                    '</tpl>',
                    {
                        isValid: function (value) {
                            return value > 0;
                        }
                    }
                ];
            }
        }
        if (!me.formatTpl.isTemplate) {
            me.formatTpl = this.getTpl('formatTpl');
        }
        return me.formatTpl;
    },

    /**
     * Respond to a cancel click on the month picker
     * @private
     */
    onCancelClick: function () {
        var me = this;
        me.collapse();
        me.focus();
    },

    getErrors: function (text) {
        var me = this,
            errors = me.callParent(arguments),
            format = me.monthSelectable ? 'Ym' : 'Y',
            minValue = me.minValue,
            maxValue = me.maxValue,
            rawValue, date;

        try {
            if (me.year > 0) {
                rawValue = me.getFormatTpl().apply({
                    year: me.year,
                    month: me.month
                });
            }
        } catch (e) {
        }

        if (Ext.isEmpty(text) == false) {
            date = me.safeParse(text);
            if (Ext.isEmpty(date)) {
                errors.push(text + ' 是无效的格式 - 必须符合格式' + format);
                return errors;
            }
        }

        if (date && minValue && me.minEquals === false && date <= minValue) {
            errors.push(format(me.minText, Ext.util.Format.date(minValue, format)));
        } else if (date && minValue && date < minValue) {
            errors.push(Ext.String.format(me.minEqualsText, Ext.util.Format.date(minValue, format)));
        }

        if (date && maxValue && me.maxEquals === false && date >= maxValue) {
            errors.push(format(me.maxText, Ext.util.Format.date(maxValue, format)));
        } else if (date && maxValue && date > maxValue) {
            errors.push(Ext.String.format(me.maxEqualsText, Ext.util.Format.date(maxValue, format)));
        }

        if (date && text != rawValue) {
            me.doSelect([parseInt(Ext.util.Format.date(date, 'm')) - 1, parseInt(Ext.util.Format.date(date, 'Y'))]);
            me.refreshDisplay();
        }

        return errors;
    },

    /**
     * Attempts to parse a given string value using a given {@link Ext.Date#parse date format}.
     * @param {String} value The value to attempt to parse
     * @return {Date} The parsed Date object, or null if the value could not be successfully parsed.
     */
    safeParse: function (value) {
        var me = this, date;
        if (me.monthSelectable) {
            date = Ext.Date.truncate(Ext.Date.parse(value, 'Ym'), Ext.Date.MONTH);
            if (Ext.isEmpty(date)) {
                date = Ext.Date.truncate(Ext.Date.parse(value, 'Y年m月'), Ext.Date.MONTH);
            }
        } else {
            date = Ext.Date.truncate(Ext.Date.parse(value, 'Y'), Ext.Date.YEAR);
            if (Ext.isEmpty(date)) {
                date = Ext.Date.truncate(Ext.Date.parse(value, 'Y年'), Ext.Date.YEAR);
            }
        }
        return date;
    }
});