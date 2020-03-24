/**
 * 带trigger的显示控件。
 * Created by cRazy on 2016/6/24.
 */
Ext.define('Cxt.form.field.DisplayTrigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.displaytriggerfield',

    requires: [
        'Ext.tip.QuickTipManager'
    ],

    editable: false,
    matchFieldWidth: false,

    triggers: {
        picker: {
            hidden: true
        },
        close: {
            itemId: 'close',
            handler: function (btn) {
                btn.fireEvent('close', btn);
            }
        }
    },

    tagLabel: undefined,

    fieldStyle: {
        'textOverflow': 'ellipsis',
        'overflow': 'hidden',
        'whiteSpace': 'nowrap',
        'padding': '3px'
    },

    fieldSubTpl: [
        '<div id="{id}" data-ref="inputEl" tabindex="-1" role="textbox" aria-readonly="true"',
        ' aria-labelledby="{cmpId}-labelEl" {inputAttrTpl}',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' class="{fieldCls} {fieldCls}-{ui}">{value}</div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    /**
     * @cfg {boolean} linkable
     * 是否链接，启用后将会触发点击事件
     */
    linkable: false,

    /**
     * @cfg {String} [fieldCls="x-label-link"]
     * link的样式
     */
    linkCls: Ext.baseCSSPrefix + 'label-link',

    initComponent: function () {
        var me = this;

        if (me.linkable) {
            me.fieldCls = me.linkCls;
        }
        me.callParent(arguments);
    },

    onChange: function (newVal, oldVal) {
        var me = this;
        me.callParent(arguments);

        if (me.rendered) {
            if (!newValue) {
                Ext.tip.QuickTipManager.unregister(me.getId());
            } else {
                Ext.tip.QuickTipManager.register({
                    target: me.getId(),
                    text: newValue
                });
            }
        }
    },

    afterRender: function () {
        var me = this;

        me.callParent(arguments);
        if (me.linkable) {
            Ext.fly(me.bodyEl).on('click', function () {
                me.fireEvent('click', me);
            });
        }
        if (!me.getValue()) {
            Ext.tip.QuickTipManager.unregister(me.getId());
        } else {
            Ext.tip.QuickTipManager.register({
                target: me.getId(),
                text: me.getValue()
            })
        }
    }
});