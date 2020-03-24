/**
 * 时间控件
 * Created by cRazy on 2016/8/9.
 */
Ext.define('Cxt.form.field.Time', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.timespinnerfield',

    mixins: [
        'Ext.form.field.Field'
    ],

    requires: [
        'Ext.form.field.Number',
        'Ext.layout.container.HBox'
    ],

    inputType: 'text',
    fieldLabel: '时间',
    value: null,
    layout: 'hbox',

    /**
     * @cfg {String} blankText
     * The error text to display if the **{@link #allowBlank}** validation fails
     */
    blankText: '该输入项为必输项',

    validateOnChange: true,

    /**
     * 整体的控件字段
     */
    entiretyField: true,

    /**
     * Performs any necessary manipulation of a raw field value to prepare it for {@link #rawToValue conversion} and/or
     * {@link #validate validation}, for instance stripping out ignored characters. In the base implementation it does
     * nothing; individual subclasses may override this as needed.
     *
     * @param {Object} value The unprocessed string value
     * @return {Object} The processed string value
     * @method
     */
    processRawValue: Ext.identityFn,

    config: {
        /**
         * @cfg {boolean} allowBlank
         * 必填
         */
        allowBlank: true,

        /**
         * @cfg {boolean} maxEquals
         * 针对于maxValue的补充限定，是否允许等于最大时间。
         */
        maxEquals: true,

        /**
         * @cfg {boolean} minEquals
         * 针对于minValue的补充限定，是否允许等于最小时间。
         */
        minEquals: true
    },

    minText: "该输入项的时间必须大于 {0}",
    maxText: "该输入项的时间必须小于 {0}",

    minEqualsText: "该输入项的时间必须大于等于 {0}",
    maxEqualsText: "该输入项的时间必须小于等于 {0}",

    initComponent: function () {
        var me = this;

        var spinnerCfg = Ext.apply({}, me.defaults, {
            readOnly: me.readOnly,
            disabled: me.disabled,
            style: 'float: left',
            listeners: {
                change: {
                    fn: me.onSpinnerChange,
                    scope: me
                }
            }
        });
        me.hoursSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, spinnerCfg, {
            hideTrigger: false,
            flex: 1,
            min: 0,
            max: 23
        }));
        me.minutesSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, spinnerCfg, {
            hideTrigger: false,
            flex: 1,
            min: 0,
            max: 59,
            padding: '0 0 0 3px'
        }));
        me.secondsSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, spinnerCfg, {
            hideTrigger: false,
            flex: 1,
            min: 0,
            max: 59,
            padding: '0 0 0 3px'
        }));
        me.items = [me.hoursSpinner, me.minutesSpinner, me.secondsSpinner];

        me.callParent(arguments);
    },

    onSpinnerChange: function (spinner, v) {
        var me = this;
        if (!me.rendered) {
            return;
        }
        //限制时间范围
        if (v > spinner.max) {
            spinner.setValue(spinner.min);
        } else if (v < spinner.min) {
            spinner.setValue(spinner.max);
        }
        this.fireEvent('change', me, me.getValue(), me.getRawValue());
        me.onChange();
    },

    onChange: function () {
        var me = this;
        if (me.validateOnChange) {
            me.validate();
        }
        me.publishState('value', me.getValue());
        me.publishState('rawValue', me.getRawValue());
    },

    isBlankValue: function () {
        var me = this;
        if (!me.rendered) {
            return true;
        }
        return !!(me.hoursSpinner.getValue() == undefined && me.minutesSpinner.getValue() == undefined && me.secondsSpinner.getValue() == undefined);
    },

    getValue: function () {
        var me = this;
        if (!me.rendered) {
            return;
        }
        if (me.hoursSpinner.getValue() == undefined && me.minutesSpinner.getValue() == undefined && me.secondsSpinner.getValue() == undefined)
            return null;

        return {
            h: me.hoursSpinner.getValue() ? this.hoursSpinner.getValue() : 0,
            m: me.minutesSpinner.getValue() ? this.minutesSpinner.getValue() : 0,
            s: me.secondsSpinner.getValue() ? this.secondsSpinner.getValue() : 0
        };
    },

    rawToValue: function (v) {
        if (!v)
            return;

        if (Ext.isObject(v)) {
            return v;
        } else if (Ext.isDate(v)) {
            v = Ext.Date.format(v, 'H:i:s');
        } else if (!Ext.isString(v)) {
            return;
        }
        var split = v.split(':');
        return {
            h: split.length > 0 ? split[0] : 0,
            m: split.length > 1 ? split[1] : 0,
            s: split.length > 2 ? split[2] : 0
        };
    },

    setValue: function (value) {
        if (this.valueToRaw(value) == this.getRawValue())
            return;

        var v = this.rawToValue(value);
        if (this.rendered) {
            this.hoursSpinner.setValue(v ? v.h : undefined);
            this.minutesSpinner.setValue(v ? v.m : undefined);
            this.secondsSpinner.setValue(v ? v.s : undefined);
        }
    },

    getRawValue: function () {
        var v = this.getValue();
        return this.valueToRaw(v);
    },

    valueToRaw: function (value) {
        if (!value)
            return null;
        value = this.rawToValue(value);
        return Ext.String.leftPad(value.h, 2, '0') + ':'
            + Ext.String.leftPad(value.m, 2, '0') + ':'
            + Ext.String.leftPad(value.s, 2, '0');
    },

    setRawValue: function (value) {
        this.setValue(value);
    },

    updateMinEquals: function () {
        var me = this;
        if (me.getRawValue()) {
            me.validate();
        }
    },

    setMinValue: function (value, minEquals) {
        var me = this;

        me.minValue = me.valueToRaw(value);
        if (minEquals === true) {
            me.minEquals = true;
        } else if (minEquals === false) {
            me.minEquals = false;
        }

        if (me.getValue()) {
            me.validate();
        }
    },

    updateMaxEquals: function () {
        var me = this;
        if (me.getRawValue()) {
            me.validate();
        }
    },

    setMaxValue: function (value, maxEquals) {
        var me = this;

        me.maxValue = me.valueToRaw(value);
        if (maxEquals === true) {
            me.maxEquals = true;
        } else if (maxEquals === false) {
            me.maxEquals = false;
        }

        if (me.getValue()) {
            me.validate();
        }
    },
    validate: function () {
        return this.checkValidityChange(this.isValid());
    },

    checkValidityChange: function (isValid) {
        var me = this;

        if (isValid !== me.wasValid) {
            me.wasValid = isValid;
            me.fireEvent('validitychange', me, isValid);
        }
        return isValid;
    },

    isValid: function () {
        var me = this,
            disabled = me.disabled,
            validate = me.forceValidation || !disabled;

        return validate ? me.validateValue(me.processRawValue(me.getRawValue())) : disabled;
    },
    /**
     * Clear any invalid styles/messages for this field.
     *
     * **Note**: this method does not cause the Field's {@link #validate} or {@link #isValid} methods to return `true`
     * if the value does not _pass_ validation. So simply clearing a field's errors will not necessarily allow
     * submission of forms submitted with the {@link Ext.form.action.Submit#clientValidation} option set.
     */
    clearInvalid: function () {
        // Clear the message and fire the 'valid' event
        var me = this,
            ariaDom = me.ariaEl.dom,
            hadError = me.hasActiveError();

        delete me.hadErrorOnDisable;

        me.unsetActiveError();

        if (hadError) {
            if (!me.ariaStaticRoles[me.ariaRole] && ariaDom) {
                ariaDom.setAttribute('aria-invalid', false);
            }
        }
    },

    /**
     * Uses {@link #getErrors} to build an array of validation errors. If any errors are found, they are passed to
     * {@link #markInvalid} and false is returned, otherwise true is returned.
     *
     * Previously, subclasses were invited to provide an implementation of this to process validations - from 3.2
     * onwards {@link #getErrors} should be overridden instead.
     *
     * @param {Object} value The value to validate
     * @return {Boolean} True if all validations passed, false if one or more failed
     */
    validateValue: function (value) {
        var me = this,
            errors = me.getErrors(value),
            isValid = Ext.isEmpty(errors);

        if (!me.preventMark) {
            if (isValid) {
                me.clearInvalid();
            } else {
                me.markInvalid(errors);
            }
        }

        return isValid;
    },

    getErrors: function (value) {
        value = arguments.length ? (value == null ? '' : value) : this.processRawValue(this.getRawValue());

        var me = this,
            errors = [],
            validator = me.validator,
            trimmed = Ext.String.trim(value),
            format = Ext.String.format,
            time = Ext.Date.parse(value, 'H:i:s'),
            minValue = Ext.Date.parse(me.minValue, 'H:i:s'),
            maxValue = Ext.Date.parse(me.maxValue, 'H:i:s'),
            msg;

        if (Ext.isFunction(validator)) {
            msg = validator.call(me, value);
            if (msg !== true) {
                errors.push(msg);
            }
        }

        if (trimmed.length < 1 || (value === me.emptyText && me.valueContainsPlaceholder)) {
            if (!me.allowBlank) {
                if (!(me.readOnly && me.ignoreBlankWhenReadOnly)) {
                    errors.push(me.blankText);
                }
            }
            // If we are not configured to validate blank values, there cannot be any additional errors
            if (!me.validateBlank) {
                return errors;
            }
        }

        if (time && minValue && me.minEquals === false && time.getTime() <= minValue.getTime()) {
            errors.push(format(me.minText, me.minValue));
        } else if (time && minValue && time.getTime() < minValue.getTime()) {
            errors.push(format(me.minEqualsText, me.minValue));
        }

        if (time && maxValue && me.maxEquals === false && time.getTime() >= maxValue.getTime()) {
            errors.push(format(me.maxText, me.maxValue));
        } else if (time && maxValue && time.getTime() > maxValue.getTime()) {
            errors.push(format(me.maxEqualsText, me.maxValue));
        }

        return errors;
    },

    /**
     * @inheritdoc Ext.form.field.Field#markInvalid
     */
    markInvalid: function (errors) {
        // Save the message and fire the 'invalid' event
        var me = this,
            ariaDom = me.ariaEl.dom,
            oldMsg = me.getActiveError(),
            active;

        me.setActiveErrors(Ext.Array.from(errors));
        active = me.getActiveError();
        if (oldMsg !== active) {
            if (!me.ariaStaticRoles[me.ariaRole] && ariaDom) {
                ariaDom.setAttribute('aria-invalid', true);
            }
        }
    }
});