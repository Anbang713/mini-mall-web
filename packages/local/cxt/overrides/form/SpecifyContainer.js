/**
 * 指定属性的设置对话框
 * Created by cRazy on 2017/8/24.
 */
Ext.define('Cxt.overrides.form.SpecifyContainer', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'specifcontainer',

    requires: [
        'Cxt.overrides.form.ConfirmContainer',
        'Ext.container.Container',
        'Ext.form.FieldContainer',
        'Ext.form.field.Display',
        'Ext.layout.container.Card',
        'Ext.layout.container.Column'
    ],

    initComponent: function () {
        var me = this,
            buttons = {
                xtype: 'container',
                layout: 'column',
                items: []
            },
            items = [buttons];
        Ext.Array.each(me.items, function (item) {
            item.fieldName = Ext.valueFrom(item.fieldName, 'field-' + me.getAutoId());
            buttons.items.push({
                xtype: 'displayfield',
                fieldName: item.fieldName,
                value: Ext.valueFrom(item.fieldCaption, item.fieldLabel),
                linkable: true,
                margin: '0 5px',
                listeners: {
                    click: function (btn) {
                        if (me.fireEvent('beforeedit', me, btn.fieldName) == false)
                            return;
                        me.layout.setActiveItem(btn.fieldName);
                    }
                }
            });

            items.push({
                xtype: 'confirmcontainer',
                itemId: item.fieldName,
                editor: item,
                listeners: {
                    confirm: function (container, value, editor) {
                        me.fireEvent('confirm', me, container.getItemId(), value, editor);
                        me.layout.setActiveItem(0);
                    },
                    cancel: function (container, value, editor) {
                        me.fireEvent('cancel', me, container.getItemId(), value, editor);
                        me.layout.setActiveItem(0);
                    }
                }
            })
        });

        Ext.apply(me, {
            layout: 'card',
            items: items
        });

        me.callParent(arguments);
    }
});