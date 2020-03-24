/**
 * Created by cRazy on 2017/6/12.
 */
Ext.define('Cxt.form.field.Cron', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.cronfield',

    requires: [
        'Cxt.window.Cron',
        'Ext.util.Format'
    ],

    triggers: {
        clear: {
            id: 'clear',
            cls: 'fa fa-times-circle',
            weight: -1,
            hidden: true,
            handler: 'clearValue',
            scope: 'this'
        },
        picker: {
            cls: 'fa fa-edit',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            editable: false
        });
        me.callParent(arguments);
    },

    onTriggerClick: function () {
        var me = this;
        Ext.widget({
            xtype: 'cronwindow',
            title: me.fieldCaption,
            value: me.value,
            belongTo: me,
            listeners: {
                change: function (window, value) {
                    me.setValue(value);
                }
            }
        }).show();
    },


    setValue: function (value) {
        var me = this;
        me.value = value;
        me.callParent(arguments);
    },

    getValue: function () {
        return this.value;
    },

    valueToRaw: function (value) {
        return Ext.util.Format.cron(value);
    },

    rawToValue: function (rawValue) {
        // 无法转换
    }
});