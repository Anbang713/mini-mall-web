/**
 * 增加日期的处理能力
 * Created by cRazy on 2016-8-9-0009.
 */
Ext.define('overrides.form.field.Date', {
    override: 'Ext.form.field.Date',

    requires: [
        'Ext.picker.Date'
    ],

    config: {

        /**
         * @cfg {String} currentLimit
         * 当前系统时间作为最大值或最小值的限制。可选值范围：[min,max]
         */
        currentLimit: undefined,

        /**
         * @cfg {boolean} currentEquals
         * 针对于currentLimit的补充限定，是否允许等于当前日期。
         */
        currentEquals: true,

        /**
         * @cfg {boolean} maxEquals
         * 针对于maxValue的补充限定，是否允许等于最大日期。
         */
        maxEquals: true,

        /**
         * @cfg {boolean} minEquals
         * 针对于minValue的补充限定，是否允许等于最小日期。
         */
        minEquals: true
    },

    /**
     * @cfg {boolean} timepart
     * 是否处理时间部分
     */
    timepart: false,

    format: 'Y-m-d',

    formatText: undefined,

    altFormats: 'Y-m-d|Y-m-d H:i:s',

    minText: "该输入项的日期必须大于 {0}",
    maxText: "该输入项的日期必须小于 {0}",

    minEqualsText: "该输入项的日期必须大于等于 {0}",
    maxEqualsText: "该输入项的日期必须小于等于 {0}",

    createPicker: function () {
        var me = this,
            minValue = me.minValue,
            maxValue = me.maxValue,
            current = new Date(),
            format = Ext.String.format;

        if (!me.timepart) {
            current = Ext.Date.clearTime(current);
            maxValue = Ext.Date.clearTime(maxValue);
            minValue = Ext.Date.clearTime(minValue);
        }
        if (!!maxValue && me.maxEquals === false) {
            maxValue = Ext.Date.add(maxValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
        }
        if (!!minValue && me.minEquals === false) {
            minValue = Ext.Date.add(minValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往后移一秒
        }
        if (me.currentLimit === 'min') {
            if (me.currentEquals === false) {
                current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往前移一秒
            }
            if (!minValue || minValue.getTime() < current.getTime()) {
                minValue = current;
            }
        }
        if (me.currentLimit === 'max') {
            if (me.currentEquals === false) {
                current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
            }
            if (!maxValue || maxValue.getTime() > current.getTime()) {
                maxValue = current;
            }
        }


        // Create floating Picker BoundList. It will acquire a floatParent by looking up
        // its ancestor hierarchy (Pickers use their pickerField property as an upward link)
        // for a floating component.
        return new Ext.picker.Date({
            pickerField: me,
            floating: true,
            preventRefocus: true,
            hidden: true,
            minDate: minValue,
            maxDate: maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            ariaDisabledDatesText: me.ariaDisabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            ariaDisabledDaysText: me.ariaDisabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minEquals ? me.minEqualsText : me.minText, me.formatDate(minValue)),
            ariaMinText: format(me.ariaMinText, me.formatDate(minValue, me.ariaFormat)),
            maxText: format(me.maxEquals ? me.maxEqualsText : me.maxText, me.formatDate(maxValue)),
            ariaMaxText: format(me.ariaMaxText, me.formatDate(maxValue, me.ariaFormat)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function () {
                    me.inputEl.focus();
                    me.collapse();
                }
            }
        });
    },

    onCollapse: function (e) {
        var me = this;
        me.callParent(arguments);
        // 关闭的时候，使之失焦。不然可能无法发出绑定事件。暂时无法判断是否会导致其他问题
        me.onBlur(e);
    },

    updateMinEquals: function (minEquals) {
        var me = this,
            picker = me.getPicker(),
            current = new Date(),
            minValue = me.minValue;

        if (picker) {
            if (!!minValue && minEquals === false) {
                minValue = Ext.Date.add(minValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往后移一秒
            }
            if (me.currentLimit === 'min') {
                if (me.currentEquals === false) {
                    current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往后移一秒
                }
                if (!minValue || minValue.getTime() < current.getTime()) {
                    minValue = current;
                }
            }
            picker.minText = Ext.String.format(me.minEquals ? me.minEqualsText : me.minText, me.formatDate(me.minValue));
            picker.setMinDate(minValue);
        }
        if (me.getRawValue()) {
            me.validate();
        }
    },

    /**
     * Replaces any existing {@link #minValue} with the new value and refreshes the Date picker.
     * @param {Date} value The minimum date that can be selected
     * @param {boolean} minEquals 是否允许等于最小值。为设置则认为true
     */
    setMinValue: function (value, minEquals) {
        var me = this,
            picker = me.getPicker(),
            current = new Date(),
            minValue = (Ext.isString(value) ? me.parseDate(value) : value);

        if (!me.timepart) {
            Ext.Date.clearTime(current);
            Ext.Date.clearTime(minValue);
        }
        me.minValue = minValue;
        if (minEquals === true) {
            me.minEquals = true;
        } else if (minEquals === false) {
            me.minEquals = false;
        }

        if (picker) {
            if (!!minValue && me.minEquals === false) {
                minValue = Ext.Date.add(minValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往后移一秒
            }
            if (me.currentLimit === 'min') {
                if (me.currentEquals === false) {
                    current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往后移一秒
                }
                if (!minValue || minValue.getTime() < current.getTime()) {
                    minValue = current;
                }
            }
            picker.minText = Ext.String.format(me.minEquals ? me.minEqualsText : me.minText, me.formatDate(me.minValue));
            picker.setMinDate(minValue);
        }

        if (me.getValue()) {
            me.validate();
        }
    },

    updateMaxEquals: function (maxEquals) {
        var me = this,
            picker = me.getPicker(),
            current = new Date(),
            maxValue = me.maxValue;

        if (!me.timepart) {
            Ext.Date.clearTime(current);
            Ext.Date.clearTime(maxValue);
        }
        if (picker) {
            if (!!maxValue && maxEquals === false) {
                maxValue = Ext.Date.add(maxValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
            }
            if (me.currentLimit === 'max') {
                if (me.currentEquals === false) {
                    current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
                }
                if (!maxValue || maxValue.getTime() > current.getTime()) {
                    maxValue = current;
                }
            }
            picker.maxText = Ext.String.format(me.maxEquals ? me.maxEqualsText : me.maxText, me.formatDate(me.maxValue));
            picker.setMaxDate(maxValue);
        }
        if (me.getRawValue()) {
            me.validate();
        }
    },

    /**
     * Replaces any existing {@link #maxValue} with the new value and refreshes the Date picker.
     * @param {Date} value The maximum date that can be selected
     * @param {boolean} maxEquals 是否允许等于最大值。为设置则认为true
     */
    setMaxValue: function (value, maxEquals) {
        var me = this,
            picker = me.getPicker(),
            current = new Date(),
            maxValue = (Ext.isString(value) ? me.parseDate(value) : value);

        if (!me.timepart) {
            Ext.Date.clearTime(current);
            Ext.Date.clearTime(maxValue);
        }
        me.maxValue = maxValue;
        if (maxEquals === true) {
            me.maxEquals = true;
        } else if (maxEquals === false) {
            me.maxEquals = false;
        }
        if (picker) {
            if (!!maxValue && me.maxEquals === false) {
                maxValue = Ext.Date.add(maxValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
            }
            if (me.currentLimit === 'max') {
                if (me.currentEquals === false) {
                    current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
                }
                if (!maxValue || maxValue.getTime() > current.getTime()) {
                    maxValue = current;
                }
            }
            picker.maxText = Ext.String.format(me.maxEquals ? me.maxEqualsText : me.maxText, me.formatDate(me.maxValue));
            picker.setMaxDate(maxValue);
        }

        if (me.getValue()) {
            me.validate();
        }
    },

    /**
     * Runs all of Date's validations and returns an array of any errors. Note that this first runs Text's validations,
     * so the returned array is an amalgamation of all field errors. The additional validation checks are testing that
     * the date format is valid, that the chosen date is within the min and max date constraints set, that the date
     * chosen is not in the disabledDates regex and that the day chosed is not one of the disabledDays.
     * @param {Object} [value] The value to get errors for (defaults to the currentLimit field value)
     * @return {String[]} All validation errors for this field
     */
    getErrors: function (value) {
        value = arguments.length > 0 ? value : this.formatDate(this.processRawValue(this.getRawValue()));

        var me = this,
            format = Ext.String.format,
            errors = me.callSuper(arguments),
            disabledDays = me.disabledDays,
            disabledDatesRE = me.disabledDatesRE,
            minValue = me.minValue,
            maxValue = me.maxValue,
            current = new Date(),
            len = disabledDays ? disabledDays.length : 0,
            i = 0,
            svalue,
            fvalue,
            day,
            time;

        if (value === null || value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
            return errors;
        }

        svalue = value;
        value = me.parseDate(value);
        if (!value) {
            errors.push(format(me.invalidText, svalue, Ext.Date.unescapeFormat(me.format)));
            return errors;
        }

        if (!me.timepart) {
            current = Ext.Date.clearTime(current);
            maxValue = Ext.Date.clearTime(maxValue);
            minValue = Ext.Date.clearTime(minValue);
        }

        time = value.getTime();
        if (minValue && me.minEquals === false && time <= minValue.getTime()) {
            errors.push(format(me.minText, me.formatDate(minValue)));
        } else if (minValue && time < minValue.getTime()) {
            errors.push(format(me.minEqualsText, me.formatDate(minValue)));
        } else if (me.currentLimit === 'min' && me.currentEquals === false && time <= current.getTime()) {
            errors.push('不能小于等于系统当前' + (me.timepart ? '时间' : '日期'));
        } else if (me.currentLimit === 'min' && time < current.getTime()) {
            errors.push('不能小于系统当前' + (me.timepart ? '时间' : '日期'));
        }

        if (maxValue && me.maxEquals === false && time >= maxValue.getTime()) {
            errors.push(format(me.maxText, me.formatDate(maxValue)));
        } else if (maxValue && time > maxValue.getTime()) {
            errors.push(format(me.maxEqualsText, me.formatDate(maxValue)));
        } else if (me.currentLimit === 'max' && me.currentEquals === false && time >= current.getTime()) {
            errors.push('不能大于等于系统当前' + (me.timepart ? '时间' : '日期'));
        } else if (me.currentLimit === 'max' && time > current.getTime()) {
            errors.push('不能大于系统当前' + (me.timepart ? '时间' : '日期'));
        }

        if (disabledDays) {
            day = value.getDay();

            for (; i < len; i++) {
                if (day === disabledDays[i]) {
                    errors.push(me.disabledDaysText);
                    break;
                }
            }
        }

        fvalue = me.formatDate(value);
        if (disabledDatesRE && disabledDatesRE.test(fvalue)) {
            errors.push(format(me.disabledDatesText, fvalue));
        }

        return errors;
    },

    /**
     * 处理使之适应全部时间格式
     * @private
     */
    parseDate: function (value) {
        if (!value || Ext.isDate(value)) {
            return value;
        }
        var me = this;
        if (Ext.isString(value)) {
            var datetime = value.split(' '),
                date = datetime[0], time = datetime[1], parts;
            if (date) {
                parts = date.split('-');
                parts[0] = Ext.String.leftPad(parts[0], 4, '0');
                parts[1] = Ext.String.leftPad(parts[1], 2, '0');
                parts[2] = Ext.String.leftPad(parts[2], 2, '0');
                datetime[0] = parts.join('-');
            }
            if (time) {
                parts = time.split(':');
                parts[0] = Ext.String.leftPad(parts[0], 2, '0');
                parts[1] = Ext.String.leftPad(parts[1], 2, '0');
                parts[2] = Ext.String.leftPad(parts[2], 2, '0');
                datetime[1] = parts.join(':');
            }
            arguments[0] = datetime.join(' ');
        }

        return me.callParent(arguments);
    }
});