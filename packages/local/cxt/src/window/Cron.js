/**
 * Created by cRazy on 2017/6/12.
 */
Ext.define('Cxt.window.Cron', {
    extend: 'Ext.window.Window',
    xtype: 'cronwindow',

    requires: [
        'Cxt.panel.cron.Daily',
        'Cxt.panel.cron.Expression',
        'Cxt.panel.cron.Month',
        'Cxt.panel.cron.Week',
        'Ext.button.Button',
        'Ext.tab.Panel',
        'Ext.toolbar.Fill',
        'Ext.window.Window'
    ],

    modal: true,
    bodyPadding: 5,
    width: 550,
    messageDock: 'top',
    constrainPosition: 'center',

    viewModel: {},

    config: {
        value: undefined
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                xtype: 'tabpanel',
                itemId: 'tabpanel',
                activeTab: 3,
                errorPrefixing: false,
                items: [{
                    xtype: 'cron.daily',
                    itemId: 'daily',
                    title: '按日'
                }, {
                    xtype: 'cron.week',
                    itemId: 'weekly',
                    title: '按周'
                }, {
                    xtype: 'cron.month',
                    itemId: 'month',
                    title: '按月'
                }, {
                    xtype: 'cron.expression',
                    itemId: 'expression',
                    viewModel: me.getViewModel(),
                    title: '表达式'
                }]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                items: ['->', {
                    xtype: 'button',
                    text: '确定',
                    ui: 'primary',
                    width: 80,
                    handler: function () {
                        me.doConfirm();
                    }
                }, {
                    xtype: 'button',
                    text: '取消',
                    width: 80,
                    handler: function () {
                        me.close();
                    }
                }, '->']
            }]
        });

        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.setValue(me.value);
    },

    setValue: function (value) {
        var me = this,
            current = 'daily';
        me.value = value;
        if (!me.rendered)
            return;

        var MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        var WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        me.getViewModel().set('cron', value);
        if (value) {
            value = value.toUpperCase();
            Ext.Array.each(MONTH, function (field, index) {
                value.replaceAll(field, index + 1);
            });
            Ext.Array.each(WEEK, function (field, index) {
                value.replaceAll(field, index + 1);
            });

            var list = value.split(' '),
                dayOfMonth = list[3],
                month = list[4],
                dayOfWeek = list[5];
            if (dayOfWeek == undefined) {
                current = 'expression';
            } else if (dayOfWeek.match(/^([1-7],)*([1-7])$/)) {
                current = 'weekly';
            } else if (dayOfMonth != '*' && dayOfMonth != '?' || dayOfWeek != '*' && dayOfWeek != '?') {
                current = 'month';
            }
        }

        me.down('#tabpanel').setActiveTab(current);
        if (me.down('#' + current).setValue(value) === false) {
            me.down('#tabpanel').setActiveTab('expression');
        }
    },

    doConfirm: function () {
        var me = this;
        if (me.isValid() == false) {
            me.messagePanel.setMessages(me.getErrors());
            return;
        }

        me.fireEvent('change', me, me.down('#tabpanel').getActiveTab().getValue());
        me.close();
    }
});