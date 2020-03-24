/**
 * Created by cRazy on 2016/8/25.
 */Ext.define('overrides.form.field.Number', {
    override: 'Ext.form.field.Number',

    requires: [
        'Ext.util.Format'
    ],

    /**
     * 默认隐藏trigger
     */
    hideTrigger: true,
    maxValue: 99999999999.9999,
    minValue: -99999999999.9999,

    minText: "该输入项必须大于 {0}",
    maxText: "该输入项必须小于 {0}",

    minEqualsText: "该输入项必须大于等于 {0}",
    maxEqualsText: "该输入项必须小于等于 {0}",

    config: {

        /**
         * @cfg {boolean} maxEquals
         * 针对于maxValue的补充限定，是否允许等于最大值。
         */
        maxEquals: true,

        /**
         * @cfg {boolean} minEquals
         * 针对于minValue的补充限定，是否允许等于最小值。
         */
        minEquals: true
    },

    /**
     * 用于在表格阻止键盘上下键的快捷键操作
     */
    stopEvents: ['up', 'down'],

    initComponent: function () {
        var me = this,
            maxValue = Ext.valueFrom(me.maxValue, Ext.Number.MAX_VALUE),
            minValue = Ext.valueFrom(me.minValue, Ext.Number.MIN_VALUE);
        if (me.decimalSeparator === null) {
            me.decimalSeparator = Ext.util.Format.decimalSeparator;
        }

        if (me.decimalPrecision != undefined) {
            maxValue = maxValue.scale(me.decimalPrecision, Ext.ROUND_DOWN);
            minValue = minValue.scale(me.decimalPrecision, Ext.ROUND_DOWN);
        }

        // 为百分比与千分比设置最大值的后缀
        if (me.suffix == Ext.util.Format.percentSign
            || me.suffix == Ext.util.Format.permilSign
            || me.suffix == Ext.util.Format.wan) {
            me.minText = "该输入项必须大于 {0}" + me.suffix;
            me.maxText = "该输入项必须小于 {0}" + me.suffix;
            me.minEqualsText = "该输入项必须大于等于 {0}" + me.suffix;
            me.maxEqualsText = "该输入项必须小于等于 {0}" + me.suffix;
            me.suffixWidth = 20;
        } else {
            me.minText = "该输入项必须大于 {0}";
            me.maxText = "该输入项必须小于 {0}";
            me.minEqualsText = "该输入项必须大于等于 {0}";
            me.maxEqualsText = "该输入项必须小于等于 {0}";
        }

        me.callSuper(arguments);

        me.setMinValue(minValue, me.minEquals);
        me.setMaxValue(maxValue, me.maxEquals);
    },

    rawToValue: function (rawValue) {
        var me = this,
            value = me.fixPrecision(me.parseValue(rawValue));
        if (value && me.suffix == Ext.util.Format.percentSign) {
            value = !isNaN(value) ? value.divide(100, me.decimalPrecision, Ext.ROUND_HALF_UP) : null;
        } else if (value && me.suffix == Ext.util.Format.permilSign) {
            value = !isNaN(value) ? value.divide(1000, me.decimalPrecision, Ext.ROUND_HALF_UP) : null;
        } else if (value && me.suffix == Ext.util.Format.wan) {
            value = !isNaN(value) ? value.multiply(10000, me.decimalPrecision, Ext.ROUND_HALF_UP) : null;
        }

        if (value == null) {
            value = rawValue || null;
        }

        return value;
    },

    valueToRaw: function (value) {
        var me = this,
            decimalSeparator = me.decimalSeparator;
        value = me.parseValue(value);
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(decimalSeparator, '.'));

        if (me.suffix == Ext.util.Format.percentSign) {
            value = isNaN(value) ? '' : value.multiply(100, me.decimalPrecision, Ext.ROUND_HALF_UP);
        } else if (me.suffix == Ext.util.Format.permilSign) {
            value = isNaN(value) ? '' : value.multiply(1000, me.decimalPrecision, Ext.ROUND_HALF_UP);
        } else if (me.suffix == Ext.util.Format.wan) {
            value = isNaN(value) ? '' : value.divide(10000, me.decimalPrecision, Ext.ROUND_HALF_UP);
        }
        if (me.rawValue == '-' && me.minValue < 0) {
            value = me.rawValue;
        } else {
            value = isNaN(value) ? '' : String(value).replace('.', decimalSeparator);
        }

        return value;
    },

    /**
     * @private
     */
    fixPrecision: function (value) {
        var me = this,
            nan = isNaN(value),
            precision = me.decimalPrecision;

        if (nan || !value) {
            return nan ? '' : value;
        } else if (!me.allowDecimals || precision <= 0) {
            precision = 0;
        }

        return parseFloat(Ext.Number.toFixed(parseFloat(value), precision));
    },

    updateMinEquals: function () {
        var me = this;
        if (me.getRawValue()) {
            me.validate();
        }
    },

    /**
     * Replaces any existing {@link #minValue} with the new value.
     * @param {Number} minValue The minimum value
     * @param {boolean} minEquals 是否允许等于最小值。为设置则认为true
     */
    setMinValue: function (minValue, minEquals) {
        var me = this,
            currentValue = me.getValue();
        minValue = Ext.valueFrom(minValue, Ext.Number.MIN_VALUE).scale(me.decimalPrecision, Ext.ROUND_UP);

        if (me.minValue < currentValue) {// 如果当期值大于原最小值，则清空，这样后面就不会触发
            currentValue = undefined;
        }
        if (minEquals === true) {
            me.minEquals = true;
        } else if (minEquals === false) {
            me.minEquals = false;
        }

        me.callParent([
            minValue
        ]);

        if (me.getRawValue()) {
            var valid = me.validate();
            if (valid && currentValue != undefined) {// 如果当期值从无效变成有效。需要publishState
                me.publishState('value', currentValue);
            }
        }
    },

    updateMaxEquals: function () {
        var me = this;
        if (me.getRawValue()) {
            me.validate();
        }
    },

    /**
     * Replaces any existing {@link #maxValue} with the new value.
     * @param {Number} maxValue The maximum value
     * @param {boolean} maxEquals 是否允许等于最大值。为设置则认为true
     */
    setMaxValue: function (maxValue, maxEquals) {
        var me = this,
            currentValue = me.getValue();
        maxValue = Ext.valueFrom(maxValue, Ext.Number.MAX_VALUE).scale(me.decimalPrecision, Ext.ROUND_DOWN);

        if (me.maxValue > currentValue) {// 如果当期值大于原最小值，则清空，这样后面就不会触发
            currentValue = undefined;
        }
        if (maxEquals === true) {
            me.maxEquals = true;
        } else if (maxEquals === false) {
            me.maxEquals = false;
        }
        me.callParent([
            maxValue
        ]);

        if (me.getRawValue()) {
            var valid = me.validate();
            if (valid && currentValue != undefined) {// 如果当期值从无效变成有效。需要publishState
                me.publishState('value', currentValue);
            }
        }
    },

    setDecimalPrecision: function (decimalPrecision) {
        this.decimalPrecision = decimalPrecision;
        this.setValue(this.getValue());
    },

    /**
     * Runs all of Number's validations and returns an array of any errors. Note that this first runs Text's
     * validations, so the returned array is an amalgamation of all field errors. The additional validations run test
     * that the value is a number, and that it is within the configured min and max values.
     * @param {Object} [value] The value to get errors for (defaults to the current field value)
     * @return {String[]} All validation errors for this field
     */
    getErrors: function (value) {
        value = arguments.length > 0 ? value : this.processRawValue(this.getRawValue());

        var me = this,
            errors = me.callSuper(arguments),
            format = Ext.String.format,
            minValue = me.minValue,
            maxValue = me.maxValue,
            num;

        // if it's blank and textfield didn't flag it then it's valid 或者已经有错误消息了
        if (value.length < 1 || errors.length) {
            return errors;
        }

        value = String(value).replace(me.decimalSeparator, '.');

        if (isNaN(value)) {
            errors.push(format(me.nanText, value));
            return errors;
        }

        num = me.parseValue(value);
        if (me.suffix == Ext.util.Format.percentSign) {
            minValue = minValue.multiply(100, minValue.scale() - 2);
            maxValue = maxValue.multiply(100, maxValue.scale() - 2);
        } else if (me.suffix == Ext.util.Format.permilSign) {
            minValue = minValue.multiply(1000, minValue.scale() - 3);
            maxValue = maxValue.multiply(1000, maxValue.scale() - 3);
        } else if (me.suffix == Ext.util.Format.wan) {
            minValue = minValue.divide(1000, minValue.scale() + 4);
            maxValue = maxValue.divide(1000, maxValue.scale() + 4);
        }

        if (minValue != undefined && me.minEquals === false && num <= minValue) {
            errors.push(format(me.minText, minValue));
        } else if (minValue != undefined && num < minValue) {
            errors.push(format(me.minEqualsText, minValue));
        }

        if (maxValue != undefined && me.maxEquals === false && num >= maxValue) {
            errors.push(format(me.maxText, maxValue));
        } else if (maxValue != undefined && num > maxValue) {
            errors.push(format(me.maxEqualsText, maxValue));
        }

        return errors;
    }
});