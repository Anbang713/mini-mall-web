/**
 * 支持缩略的文本显示控件
 * Created by cRazy on 2016/6/24.
 */
Ext.define('overrides.form.field.Display', {
    override: 'Ext.form.field.Display',

    requires: [
        'Ext.dom.Helper',
        'Ext.tip.QuickTipManager',
        'Ext.util.Format'
    ],

    /**
     * @cfg {boolean} ellipsis
     * 超宽省略
     */
    ellipsis: true,
    /**
     * @cfg {boolean} showTip
     * 是否冒泡显示，默认为false.
     */
    showTip: false,

    /**
     * @cfg {String} textAlign
     * Controls the position and alignment of the {@link #fieldLabel}. Valid values are:
     *
     *   - "left" (the default) - The text is positioned to the left of the field, with its text aligned to the left.
     *     Its width is determined by the {@link #textWidth} config.
     *   - "center" - The text is positioned above the field.
     *   - "right" - The text is positioned to the left of the field, with its text aligned to the right.
     *     Its width is determined by the {@link #textWidth} config.
     */
    textAlign: 'left',

    /**
     * @cfg {String} defaultDisplay
     * 为空时的显示内容
     */

    config: {
        /**
         * @cfg {boolean} linkable
         * 是否链接，启用后将会触发点击事件
         */
        linkable: false
    },

    linkCls: Ext.baseCSSPrefix + 'display-field-link',

    /**
     * @cfg {boolean} compare
     * 比较模式
     */
    compare: false,

    compareCls: Ext.baseCSSPrefix + 'field-compare-changed',

    /**
     * 针对tip做的renderer
     */
    tipRenderer: undefined,

    initComponent: function () {
        var me = this, style, fieldStyle;
        if (me.fieldLabel && me.defaultDisplay == undefined) {
            me.defaultDisplay = '-';
        }

        if (me.ellipsis) {
            style = me.fieldStyle;
            fieldStyle = Ext.isObject(style) ? Ext.DomHelper.generateStyles(style, null, true) : style || '';
            fieldStyle += ";text-overflow:ellipsis;overflow:hidden;white-space:nowrap";
            me.fieldStyle = fieldStyle;
        }
        if (me.textAlign) {
            style = me.fieldStyle;
            fieldStyle = Ext.isObject(style) ? Ext.DomHelper.generateStyles(style, null, true) : style || '';
            fieldStyle += ";text-align: " + me.textAlign;
            me.fieldStyle = fieldStyle;
        }

        me.callParent(arguments);
    },

    /**
     * Returns whether or not the field value is currently valid by {@link #getErrors validating} the field's current
     * value. The {@link #validitychange} event will not be fired; use {@link #validate} instead if you want the event
     * to fire. **Note**: {@link #disabled} fields are always treated as valid.
     *
     * Implementations are encouraged to ensure that this method does not have side-effects such as triggering error
     * message display.
     *
     * @return {Boolean} True if the value is valid, else false
     */
    isValid: function () {// 像我们这么吊的系统，display就是会报错。
        var me = this,
            errors = me.getErrors(me.value),
            isValid = Ext.isEmpty(errors);

        if (isValid) {
            me.clearInvalid();
        } else {
            me.markInvalid(errors);
        }

        return isValid;
    },

    /**
     * Returns whether or not the field value is currently valid by {@link #getErrors validating} the field's current
     * value, and fires the {@link #validitychange} event if the field's validity has changed since the last validation.
     * **Note**: {@link #disabled} fields are always treated as valid.
     *
     * Custom implementations of this method are allowed to have side-effects such as triggering error message display.
     * To validate without side-effects, use {@link #isValid}.
     *
     * @return {Boolean} True if the value is valid, else false
     */
    validate: function () {
        return this.checkValidityChange(this.isValid());
    },

    setRawValue: function (value) {
        var me = this;

        value = Ext.valueFrom(value, '');
        if (me.getRawValue() === me.getDisplayValue(value))
            return;

        me.rawValue = value;
        if (me.rendered) {
            me.inputEl.dom.innerHTML = me.getDisplayValue();
            me.updateLayout();
            me.refreshCompare();
        }
        return value;
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.clickListener = Ext.fly(me.bodyEl).on('click', function (e, t, eOpts) {
            me.onClick(e, t, eOpts);
        });

        if (me.defaultDisplay && !me.getDisplayValue()) {
            me.inputEl.dom.innerHTML = me.defaultDisplay;
        }

        if (me.value && me.showTip) {
            Ext.tip.QuickTipManager.register({
                target: me.getId(),
                text: me.getDisplayTip()
            });
        }
    },

    onClick: function (e, t, eOpts) {
        var me = this;
        if (me.linkable) {
            me.fireEvent('click', me, e, t, eOpts);
        }
    },

    /**
     * @private
     * Called when the field's value changes. Performs validation if the {@link #validateOnChange}
     * config is enabled, and invokes the dirty check.
     */
    onChange: function (newVal) {
        var me = this;
        me.callParent(arguments);

        if (newVal && me.showTip) {
            Ext.tip.QuickTipManager.register({
                target: me.getId(),
                text: me.getDisplayTip()
            });
        } else {
            Ext.tip.QuickTipManager.unregister(me.getId());
        }
        me.refreshCompare();
    },

    setCompareValue: function (compareValue) {
        var me = this;
        me.compareValue = compareValue;
        me.refreshCompare();
    },

    refreshCompare: function () {
        if (!this.compare || !this.rendered) {
            return;
        }
        var me = this,
            el = me.el,
            displayValue = me.getDisplayValue(),
            displayCompare = me.getDisplayValue(Ext.isEmpty(me.compareValue) ? me.defaultDisplay : me.compareValue);

        if (displayValue != displayCompare) {
            if (el && !el.hasCls(me.compareCls))
                el.addCls(me.compareCls);
            me.inputEl.dom.innerHTML = displayValue + '<span style="color: #BBBBBB"> ( ' + displayCompare + ' ) </span>';

            if (me.showTip) {
                Ext.tip.QuickTipManager.register({
                    target: me.getId(),
                    text: displayValue + ' ( ' + displayCompare + ' ) '
                });
            }
        } else if (el.hasCls(me.compareCls)) {
            el.removeCls(me.compareCls);
            me.inputEl.dom.innerHTML = displayValue;
        }
    },

    /**
     * @private
     * Format the value to display.
     */
    getDisplayValue: function (value) {
        var me = this,
            display;
        if (value === undefined) {
            value = me.getRawValue();
        }

        if (me.renderer && Ext.isFunction(me.renderer.call)) {
            display = me.renderer.call(me.scope || me, value, me);
        } else {
            display = me.htmlEncode ? Ext.util.Format.htmlEncode(value) : value;
        }
        return Ext.isEmpty(display) ? me.defaultDisplay : display;
    },

    /**
     * @private
     * Format the value to display.
     */
    getDisplayTip: function (value) {
        var me = this,
            display;
        if (value === undefined) {
            value = me.getRawValue();
        }

        if (me.tipRenderer) {
            display = me.tipRenderer.call(me.scope || me, value, me);
        } else {
            display = me.getDisplayValue(value);
        }
        return Ext.isEmpty(display) ? me.defaultDisplay : display;
    },

    /**
     * 增加了validator的处理
     */
    getErrors: function (value) {
        value = arguments.length ? (value == null ? '' : value) : this.processRawValue(this.getRawValue());
        var me = this,
            errors = [],
            validationField = this.getValidationField(),
            validation = me.getValidation(),
            validator = me.validator,
            valid;

        if (validationField) {
            valid = validationField.validate(value);
            if (valid !== true) {
                errors = Ext.Array.merge(errors, valid);
            }
        }
        if (validation && validation !== true) {
            errors.push(validation);
        }

        if (Ext.isFunction(validator)) {
            valid = validator.call(me, me.getValue());
            if (valid !== true) {
                errors = Ext.Array.merge(errors, valid);
            }
        }

        return errors;
    },

    setLinkable: function (linkable) {
        var me = this,
            linkCls = me.linkCls;
        me.linkable = !!linkable;
        me[linkable ? 'addCls' : 'removeCls'](linkCls);
    },

    beforeDestroy: function () {
        var me = this;
        if (me.rendered) {
            Ext.destroy(
                me.clickListener
            );
            if (me.showTip) {
                Ext.tip.QuickTipManager.unregister(me.getId());
            }
        }

        me.callParent(arguments);
    }
});