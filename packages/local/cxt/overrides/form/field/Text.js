/**
 * Created by cRazy on 2016/9/30.
 */
Ext.define('overrides.form.field.Text', {
    override: 'Ext.form.field.Text',

    requires: [
        'Ext.form.field.VTypes'
    ],

    /**
     * @cfg {String} suffix
     * 后缀
     */

    /**
     * @cfg {String} suffixWidth
     * 后缀宽度
     */
    suffixWidth: 45,

    /**
     * @cfg {boolean} ignoreBlankWhenReadOnly
     * 当只读的时候忽略必填
     */
    ignoreBlankWhenReadOnly: false,

    /**
     * @cfg {boolean} hasPrefix
     * 支持前缀功能
     */
    hasPrefix: false,

    /**
     * @cfg {number} prefixMaxWidth
     * 前缀允许的最大长度
     */
    prefixMaxWidth: 80,

    /**
     * @cfg {String}
     * The CSS class that is added to the element wrapping the input element
     */
    prefixCls: Ext.baseCSSPrefix + 'form-text-prefix',

    config: {
        prefix: undefined
    },

    childEls: [
        /**
         * @property {Ext.dom.Element} prefixEl
         * 前缀
         */
        'prefixEl'
    ],

    initComponent: function () {
        var me = this;
        if (me.hasPrefix) {
            me.preSubTpl = [
                '<div id="{cmpId}-triggerWrap" data-ref="triggerWrap"',
                ' role="presentation" class="{triggerWrapCls} {triggerWrapCls}-{ui} hasPrefix">',
                '<div id="{cmpId}-prefixEl" data-ref="prefixEl" role="presentation" class="{prefixCls}" style="display: none;max-width: ' + me.prefixMaxWidth + 'px"></div>',
                '<div id="{cmpId}-inputWrap" data-ref="inputWrap"',
                ' role="presentation" class="{inputWrapCls} {inputWrapCls}-{ui}">'
            ]
        }

        if (!Ext.isEmpty(me.suffix)) {
            if (!me.suffixWidth) {
                Ext.raise("You must specify a suffixWidth config.");
            }
            me.postSubTpl = [
                '</div>', // end inputWrap
                '<div class="x-form-text-wrap" style="vertical-align: middle;width:' + me.suffixWidth + 'px;padding:0 3px;text-align:right"> ',
                me.suffix,
                '</div>',
                '<tpl for="triggers">{[values.renderTrigger(parent)]}</tpl>',
                '</div>' // end triggerWrap
            ];
        }
        if (Ext.isString(me.regex)) {
            me.regex = new RegExp(me.regex);
        }

        me.callParent(arguments);
    },


    getSubTplData: function (fieldData) {
        var me = this,
            data = me.callParent(arguments);
        Ext.apply(data, {
            prefixCls: me.prefixCls
        });
        return data;
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.setMaxLength(me.maxLength);
    },

    isAllowBlank: function () {
        return this.allowBlank;
    },

    /**
     *  设置是否必填
     */
    setAllowBlank: function (allowBlank) {
        var me = this,
            fieldLabel = me.fieldCaption;
        me.allowBlank = allowBlank;

        if (me.rendered && fieldLabel) {
            if (allowBlank == false && fieldLabel.indexOf('<span style="color: red">*</span>') < 0) {
                me.setFieldLabel('<span style="color: red"> * </span>' + fieldLabel);
            } else {
                me.setFieldLabel(fieldLabel);
            }
        }
    },

    setMaxLength: function (maxLength) {
        var me = this;
        if (maxLength > 524288 || maxLength == null || maxLength == undefined) {
            maxLength = 524288;
        }

        me.maxLength = maxLength;
        if (me.rendered && me.inputEl && me.inputEl.dom) {
            me.inputEl.dom.maxLength = maxLength;
        }
    },

    getMaxLength: function () {
        var me = this;
        if (me.rendered && me.inputEl && me.inputEl.dom) {
            return me.inputEl.dom.maxLength === -1 ? me.maxLength : me.inputEl.dom.maxLength;
        }
        return me.maxLength;
    },

    setMinLength: function (minLength) {
        var me = this;
        minLength = Ext.valueFrom(minLength, 0);
        me.minLength = minLength;
    },

    getMinLength: function () {
        var me = this;
        return me.minLength;
    },

    updatePrefix: function (prefix) {
        var me = this;
        if (me.hasPrefix) {
            me.prefixEl = me.el.getById(me.getId() + '-prefixEl');
            me.prefixEl.setStyle('display', Ext.isEmpty(prefix) ? 'none' : 'table-cell');
            me.prefixEl.dom.innerText = prefix;
            me.updateLayout();
        }
    },

    getErrors: function (value) {
        value = arguments.length ? (value == null ? '' : value) : this.processRawValue(this.getRawValue());

        var me = this,
            errors = me.callSuper([value]),
            validator = me.validator,
            vtype = me.vtype,
            vtypes = Ext.form.field.VTypes,
            regex = me.regex,
            format = Ext.String.format,
            msg, trimmed, isBlank;

        if (Ext.isFunction(validator)) {
            msg = validator.call(me, value);
            if (msg !== true) {
                errors.push(msg);
            }
        }

        trimmed = me.allowOnlyWhitespace ? value : Ext.String.trim(value);

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
            isBlank = true;
        }

        // If a blank value has been allowed through, then exempt it from the minLength check.
        // It must be allowed to hit the vtype validation.
        if (!isBlank && value.length < me.minLength) {
            errors.push(format(me.minLengthText, me.minLength));
        }

        if (value.length > me.maxLength) {
            errors.push(format(me.maxLengthText, me.maxLength));
        }

        if (vtype) {
            if (!vtypes[vtype](value, me)) {
                errors.push(me.vtypeText || vtypes[vtype + 'Text']);
            }
        }

        if (regex && !regex.test(value)) {
            errors.push(me.regexText || me.invalidText);
        }

        return errors;
    }

});