/**
 * Created by cRazy on 2016/8/4.
 */
Ext.define('Cxt.panel.TextArea', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.textareapanel',

    requires: [
        'Ext.form.field.TextArea'
    ],

    /**
     * @cfg {boolean} allowBlank
     * 必填
     */
    allowBlank: true,

    /**
     *  比较视图
     */
    compare: false,
    compareCls: Ext.baseCSSPrefix + 'field-compare-changed',

    /**
     * @cfg {Object} textareaConfig
     * 文本框的属性
     */
    textareaConfig: {},

    initComponent: function () {
        var me = this,
            items = [],
            textarea = Ext.apply({}, me.textareaConfig, {
                xtype: 'textareafield',
                itemId: 'textarea',
                ui: 'plain',
                width: '100%',
                maxLength: 1024,
                allowBlank: me.allowBlank,
                readOnly: me.readOnly || me.compare
            });

        items.push(textarea);
        if (me.compare) {
            items.push({
                xtype: 'textareafield',
                itemId: 'compare',
                ui: 'plain',
                fieldCls: Ext.baseCSSPrefix + 'field-compare-cancel',
                width: '100%',
                hidden: true,
                readOnly: true
            })
        }

        me.fieldCaption = me.title;
        if (me.title && me.allowBlank === false) {
            me.title = '<span style="color: red"> * </span>' + me.title;
        }

        Ext.apply(me, {
            bodyPadding: 5,
            items: items
        });
        me.callParent(arguments);
    },

    getErrors: function () {
        var me = this,
            textarea = me.down('#textarea'),
            errors = [];

        Ext.Array.each(textarea.getErrors(), function (error) {
            var message = {
                text: error,
                source: textarea
            };
            if (!Ext.isEmpty(me.fieldCaption)) {
                message.text = me.fieldCaption + "：" + error;
            }
            errors.push(message);
        });
        return errors;
    },

    setAllowBlank: function (allowBlank) {
        var me = this;
        me.allowBlank = allowBlank;
        if (me.title) {
            if (me.allowBlank === false) {
                me.setTitle('<span style="color: red"> * </span>' + me.title);
            } else {
                me.setTitle(me.title);
            }
            me.down('#textarea').setAllowBlank(me.allowBlank);
        }
    },

    setValue: function (value) {
        var me = this;
        me.value = value;
        if (me.rendered) {
            me.down('#textarea').setValue(value);
        }
        me.refreshCompare();
    },

    setCompareValue: function (value) {
        var me = this;
        me.compareValue = value;
        if (me.rendered) {
            me.down('#compare').setValue(value);
        }
        me.refreshCompare();
    },

    refreshCompare: function () {
        var me = this,
            inputEl;
        if (!me.compare || !me.rendered || me.destroyed)
            return;

        inputEl = me.down('#textarea').inputEl;
        if (me.value != me.compareValue) {
            if (!inputEl.hasCls(me.compareCls))
                inputEl.addCls(me.compareCls);
        } else if (inputEl.hasCls(me.compareCls)) {
            inputEl.removeCls(me.compareCls);
        }
        me.down('#compare').setHidden(me.value == me.compareValue);
    }

});