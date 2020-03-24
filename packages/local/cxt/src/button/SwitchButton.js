/**
 * 开关
 * Created by cRazy on 2016/12/17.
 */
Ext.define('Cxt.button.SwitchButton', {
    extend: 'Ext.Component',
    xtype: 'switchbutton',

    ui: 'switch',

    childEls: [
        'bodyEl', 'inputEl'
    ],
    ariaEl: 'bodyEl inputEl',

    /**
     * @cfg {String} readOnlyCls
     * The CSS class applied to the component's main element when it is {@link #readOnly}.
     */
    readOnlyCls: Ext.baseCSSPrefix + 'item-readonly',

    maskOnDisable: false,

    switchWrapCls: Ext.baseCSSPrefix + 'switchWrap',

    renderTpl: [
        '<div  id="{id}-bodyEl" data-ref="bodyEl" class="{switchWrapCls}">',
        '<input id="{id}-inputEl" data-ref="inputEl" type="checkbox" checked="true"',
        '<tpl if="disabled"> disabled="disabled"</tpl>',
        '/>',
        '<label></label>',
        '</div>'
    ],

    initValue: function () {
        var me = this,
            value = !!me.value;

        /**
         * @property {Object} originalValue
         * The original value of the field as configured in the {@link #checked} configuration, or as loaded by the last
         * form load operation if the form's {@link Ext.form.Basic#trackResetOnLoad trackResetOnLoad} setting is `true`.
         */
        me.originalValue = me.lastValue = value;

        // Set the initial checked state
        me.setValue(value);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.inputEl.on({
            change: 'onBoxClick',
            scope: me
        });

        me.initValue();
    },

    initRenderData: function () {
        var me = this,
            data = me.callParent(arguments);
        Ext.apply(data, {
            switchWrapCls: me.switchWrapCls,
            disabled: me.disabled || me.readOnly
        });
        return data;
    },

    /**
     * Checks whether the value of the field has changed since the last time it was checked.
     * If the value has changed, it:
     *
     * 1. Fires the {@link #change change event},
     * 2. Performs validation if the {@link #validateOnChange} config is enabled, firing the
     *    {@link #validitychange validitychange event} if the validity has changed, and
     * 3. Checks the {@link #isDirty dirty state} of the field and fires the {@link #dirtychange dirtychange event}
     *    if it has changed.
     */
    checkChange: function () {
        var me = this,
            newVal, oldVal;

        if (!me.suspendCheckChange) {
            newVal = me.getValue();
            oldVal = me.lastValue;

            if (!me.destroyed && newVal != oldVal) {
                me.lastValue = newVal;
                me.fireEvent('change', me, newVal, oldVal);
                me.onChange(newVal, oldVal);
            }
        }
    },

    onBoxClick: function () {
        var me = this;
        if (me.fireEvent('beforechange', me, !me.value) === false) {
            me.inputEl.dom.checked = me.value;
            return;
        }
        if (!me.disabled && !me.readOnly) {
            me.value = !me.value;
            me.inputEl.dom.checked = me.value;
            me.publishValue();
            me.checkChange();
        }
    },

    onChange: function () {
    },

    onEnable: function () {
        var me = this,
            inputEl = me.inputEl;
        me.callParent();
        if (inputEl) {
            // Can still be disabled if the field is readOnly
            inputEl.dom.disabled = me.readOnly;
        }
    },

    setReadOnly: function (readOnly) {
        var me = this,
            inputEl = me.inputEl;
        readOnly = !!readOnly;
        me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
        if (inputEl) {
            // Set the button to disabled when readonly
            inputEl.dom.disabled = !!readOnly || me.disabled;
        }
    },

    getValue: function () {
        var me = this;
        return !!me.value;
    },

    setValue: function (value) {
        var me = this;
        value = !!value;
        if (me.value == value)
            return;
        me.lastValue = me.value = value;
        me.inputEl.dom.checked = value;
        me.publishValue();
    },

    publishValue: function () {
        var me = this;

        if (me.rendered) {
            me.publishState('value', me.getValue());
        }
    }
});