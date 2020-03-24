/**
 * Created by cRazy on 2017/6/12.
 */
Ext.define('Cxt.panel.cron.Month', {
    extend: 'Cxt.panel.cron.Daily',
    alias: 'widget.cron.month',

    requires: [
        'Cxt.form.field.MultiTagField',
        'Ext.form.FieldContainer',
        'Ext.layout.container.Column'
    ],

    viewModel: {
        data: {
            entity: {
                type: 'fixed',
                specified: '#1',
                interval: 'once',
                time: {h: 0, m: 0, s: 0}
            }
        },
        formulas: {
            fixed: function (get) {
                return get('entity.type') == 'fixed';
            },
            once: function (get) {
                return get('entity.interval') == 'once';
            }
        }
    },

    createItems: function () {
        var me = this,
            items = me.callParent(arguments);
        Ext.Array.insert(items, 0, [{
            xtype: 'combo',
            fieldLabel: '类型',
            allowBlank: false,
            columnWidth: 1,
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            displayField: 'caption',
            store: {
                type: 'store',
                data: [{
                    value: 'fixed', caption: '固定日'
                }, {
                    value: 'relative', caption: '相对日'
                }]
            },
            bind: {
                value: '{entity.type}'
            }
        }, {
            xtype: 'multitagfield',
            fieldLabel: '每月',
            allowBlank: false,
            columnWidth: 1,
            selectOnFocus: false,
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            displayField: 'caption',
            store: {
                type: 'store',
                data: function () {
                    var list = Ext.Number.list(1, 31),
                        result = [];
                    Ext.Array.each(list, function (value) {
                        result.push({
                            value: value,
                            caption: value + '日'
                        })
                    });
                    result.push({
                        value: 'L',
                        caption: '最后一日'
                    });
                    return result;
                }()
            },
            bind: {
                value: '{entity.dayOfMonth}',
                hidden: '{!fixed}'
            },
            validator: function (records) {
                if (Ext.Array.findBy(records, function (record) {
                        return record.get('value') == 'L';
                    })) {
                    return records.length > 1 ? '选择“最后一日”时，不能选择其它日期' : true;
                }
                return true;
            }
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '每月',
            allowBlank: false,
            columnWidth: 1,
            hidden: true,
            layout: 'column',
            bind: {
                hidden: '{fixed}'
            },
            items: [{
                xtype: 'combo',
                columnWidth: 0.33,
                editable: false,
                queryMode: 'local',
                valueField: 'value',
                displayField: 'caption',
                store: {
                    type: 'store',
                    data: [{
                        value: '#1', caption: '第一个'
                    }, {
                        value: '#2', caption: '第二个'
                    }, {
                        value: '#3', caption: '第三个'
                    }, {
                        value: '#4', caption: '第四个'
                    }, {
                        value: 'L', caption: '最后一个'
                    }]
                },
                bind: {
                    value: '{entity.specified}'
                }
            }, {
                xtype: 'multitagfield',
                fieldCaption: '星期',
                allowBlank: false,
                columnWidth: 0.67,
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
                    hidden: '{fixed}',
                    specified: '{entity.specified}',
                    value: '{entity.dayOfWeek}'
                },
                setSpecified: function () {
                    if (!this.isBlankValue())
                        this.isValid(true);
                },
                validator: function (records) {
                    if (me.getViewModel().get('entity.specified') == 'L' && records && records.length > 1) {
                        return '“最后一个”时，只能选择一个日期';
                    }
                    return true;
                }
            }]
        }]);
        return items;
    },

    setValue: function (value) {
        var me = this,
            entity = {
                type: 'fixed',
                specified: '#1',
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

    rawToValue: function (value) {
        var me = this,
            entity = me.callParent(arguments);
        if (!entity || !value) {
            return;
        }
        entity.specified = '#1';// 设置默认值

        var list = value.split(' '),
            dayOfMonth = list[3],
            month = list[4],
            dayOfWeek = list[5];

        if (dayOfMonth.match(/^(\d{1,2},)*(\d{1,2})|L$/)) {
            entity.type = 'fixed';
            entity.dayOfMonth = dayOfMonth.split(',');
        } else if (dayOfMonth != '*' && dayOfMonth != '?') {
            return;
        } else if (dayOfWeek.match(/^((\d,)*(\d)#\d)$|(^\dL$)/)) {
            entity.type = 'relative';
            if (dayOfWeek.endsWith('L')) {
                entity.specified = 'L';
                entity.dayOfWeek = dayOfWeek.substr(0, dayOfWeek.length - 1).split(',');
            } else if (dayOfWeek.indexOf('#')) {
                entity.specified = dayOfWeek.substr(dayOfWeek.length - 2, dayOfWeek.length);
                entity.dayOfWeek = dayOfWeek.substr(0, dayOfWeek.length - 2).split(',');
            }
        } else {
            return;
        }

        return entity;
    },

    getValue: function () {
        var me = this,
            entity = me.getViewModel().get('entity');
        if (entity.type == 'fixed') {
            return me.encodeTimePart(entity) + ' ' + entity.dayOfMonth.join(',') + ' * ?';
        } else {
            return me.encodeTimePart(entity) + ' ? * ' + entity.dayOfWeek.join(',') + entity.specified;
        }
    }
});