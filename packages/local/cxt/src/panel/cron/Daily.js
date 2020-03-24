/**
 * Created by cRazy on 2017/6/12.
 */
Ext.define('Cxt.panel.cron.Daily', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cron.daily',

    requires: [
        'Cxt.form.field.Time',
        'Ext.data.Store',
        'Ext.form.field.ComboBox'
    ],

    viewModel: {
        data: {
            entity: {
                interval: 'once',
                time: {h: 0, m: 0, s: 0}
            }
        },
        formulas: {
            once: function (get) {
                return get('entity.interval') == 'once';
            }
        }
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: me.createItems()
        });

        me.callParent(arguments);
    },

    createItems: function () {
        return [{
            xtype: 'combo',
            fieldLabel: '频率',
            columnWidth: 1,
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            displayField: 'caption',
            store: {
                type: 'store',
                data: [{
                    value: 'once', caption: '每日一次'
                }, {
                    value: '0 0 ?/3', caption: '每3小时'
                }, {
                    value: '0 0 ?/2', caption: '每2小时'
                }, {
                    value: '0 0 ?/1', caption: '每1小时'
                }, {
                    value: '0 0/30 ?', caption: '每30分钟'
                }, {
                    value: '0 0/15 ?', caption: '每15分钟'
                }]
            },
            bind: {
                value: '{entity.interval}'
            }
        }, {
            xtype: 'timespinnerfield',
            fieldLabel: '触发时间',
            allowBlank: false,
            columnWidth: 1,
            store: {
                type: 'store',
                data: Ext.Number.list(0, 23)
            },
            bind: {
                value: '{entity.time}',
                hidden: '{!once}'
            }
        }, {
            xtype: 'combo',
            fieldLabel: '从(h)',
            allowBlank: false,
            columnWidth: 1,
            hidden: true,
            editable: false,
            queryMode: 'local',
            valueField: '.',
            displayField: '.',
            store: {
                type: 'store',
                data: function () {
                    var n = 0,
                        list = [];
                    while (n <= 23) {
                        list.push(n + '');
                        n += 1;
                    }
                    return list;
                }()
            },
            bind: {
                value: '{entity.from}',
                hidden: '{once}'
            }
        }, {
            xtype: 'combo',
            fieldLabel: '到(h)',
            allowBlank: false,
            columnWidth: 1,
            hidden: true,
            editable: false,
            queryMode: 'local',
            valueField: '.',
            displayField: '.',
            store: {
                type: 'store',
                data: function () {
                    var n = 0,
                        list = [];
                    while (n <= 23) {
                        list.push(n + '');
                        n += 1;
                    }
                    return list;
                }()
            },
            bind: {
                value: '{entity.to}',
                hidden: '{once}'
            }
        }];
    },

    setValue: function (value) {
        var me = this,
            entity = {
                interval: 'once',
                time: {h: 0, m: 0, s: 0}
            };
        if (value) {
            entity = me.rawToValue(value);
            if (!entity) {
                return false;
            }
        }

        me.getViewModel().set('entity', entity);
    },

    getValue: function () {
        var me = this,
            entity = me.getViewModel().get('entity');
        return me.encodeTimePart(entity) + ' ? * *';
    },

    rawToValue: function (value) {
        var entity = {
                interval: 'once',
                time: {h: 0, m: 0, s: 0}
            },
            split, interval;

        if (!value)
            return;

        var list = value.split(' '),
            seconds = list[0],
            minutes = list[1],
            hours = list[2];

        if (seconds.charCount('/') || seconds.charCount('-'))
            return;
        if (minutes.charCount('-'))
            return;

        if (minutes.charCount('/')) {
            split = minutes.split('/');
            minutes = split[0];
            interval = split[1];
            if (interval != 15 && interval != 30 || minutes.indexOf('-') > 0)
                return;
            entity.interval = '0 0/' + interval + ' ?';
        }
        if (hours.charCount('/')) {
            split = hours.split('/');
            hours = split[0];
            interval = split[1];
            if (interval != 1 && interval != 2 && interval != 3)
                return;
            entity.interval = '0 0 ?/' + interval;
        }
        if (hours.indexOf('-') > 0) {
            entity.from = hours.split('-')[0];
            entity.to = hours.split('-')[1];
            hours = 0;
            if (entity.to == 24) {
                entity.to = 0;
            }
        }
        entity.time = {h: hours, m: minutes, s: seconds};
        return entity;
    },

    encodeTimePart: function (entity) {
        var cron = '';
        if (entity.interval == 'once' && entity.time) {
            cron = entity.time.s + ' ' + entity.time.m + ' ' + entity.time.h;
        } else if (entity.from == entity.to) {
            cron = entity.interval.replace('?', '*');
        } else {
            cron = entity.interval.replace('?', entity.from + '-' + entity.to);
        }
        return cron;
    }
});