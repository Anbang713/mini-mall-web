/**
 * Created by cRazy on 2017/6/12.
 */
Ext.define('Cxt.panel.cron.Week', {
    extend: 'Cxt.panel.cron.Daily',
    alias: 'widget.cron.week',

    requires: [
        'Cxt.form.field.MultiTagField'
    ],

    createItems: function () {
        var me = this,
            items = me.callParent(arguments);
        Ext.Array.insert(items, 0, [{
            xtype: 'multitagfield',
            fieldLabel: '每周',
            allowBlank: false,
            columnWidth: 1,
            selectOnFocus: false,
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            displayField: 'caption',
            store: {
                type: 'store',
                data: [{
                    value: '1', caption: '周日'
                }, {
                    value: '2', caption: '周一'
                }, {
                    value: '3', caption: '周二'
                }, {
                    value: '4', caption: '周三'
                }, {
                    value: '5', caption: '周四'
                }, {
                    value: '6', caption: '周五'
                }, {
                    value: '7', caption: '周六'
                }]
            },
            bind: {
                value: '{entity.days}'
            }
        }]);
        return items;
    },

    rawToValue: function (value) {
        var me = this,
            entity = me.callParent(arguments);
        if (!entity || !value) {
            return;
        }
        var list = value.split(' '),
            dayOfMonth = list[3],
            month = list[4],
            dayOfWeek = list[5];

        if (dayOfMonth != '?' || month != '*' || !dayOfWeek.match(/^([1-7],)*([1-7])$/)) {
            return;
        }

        entity.days = dayOfWeek.split(',');
        return entity;
    },

    getValue: function () {
        var me = this,
            entity = me.getViewModel().get('entity');
        return me.encodeTimePart(entity) + ' ? * ' + entity.days.join(',');
    }
});