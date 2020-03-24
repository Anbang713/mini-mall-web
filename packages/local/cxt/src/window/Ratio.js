/**
 * Created by cRazy on 2016/12/27.
 */
Ext.define('Cxt.window.Ratio', {
    extend: 'Ext.window.Window',
    xtype: 'ratiowindow',

    requires: [
        'Cxt.util.TaxCalculator',
        'Ext.button.Button',
        'Ext.data.Store',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Number',
        'Ext.grid.Panel',
        'Ext.grid.plugin.CellEditing',
        'Ext.toolbar.Fill',
        'Ext.util.Format',
        'Ext.window.Window'
    ],

    modal: true,
    bodyPadding: 5,
    width: 550,
    messageDock: 'top',
    constrainPosition: 'center',

    viewModel: {
        formulas: {
            clazz: {
                get: function (get) {
                    return get('ratio.@class');
                },
                set: function (value) {
                    this.set('ratio.@class', value);
                }
            },
            isNormal: function (get) {
                return get('ratio.@class') == 'com.hd123.m3.commons.biz.ratio.NormalRatio';
            },
            normalRateReadOnly: function (get) {
                return get('taxInclusive') != true || get('editable') != true;
            },
            normalRateWithoutTax: function (get) {
                return get('ratio.@class') == 'com.hd123.m3.commons.biz.ratio.NormalRatio' && get('taxInclusive') == false;
            }
        }
    },

    allowBlank: false,

    editable: true,

    /**
     * 设置后，ratioType唯一，不允许操作者修改
     */
    ratioTypeOnly: false,

    /**
     * 设置ratioType
     */
    ratioType: false,

    /**
     * 是否含税，当设置为false时，为不含税。根据去税计算含税
     */
    taxInclusive: true,

    config: {
        /**
         * 小数位数
         */
        scale: 4,
        /**
         * @param roundingMode
         *          舍入处理
         */
        roundingMode: Ext.ROUND_HALF_UP,
        /**
         * 税率，自动计算使用。
         */
        taxRate: {
            rate: 0
        }
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                xtype: 'combobox',
                itemId: 'ratioType',
                width: '80%',
                queryMode: 'local',
                fieldLabel: '提成方式',
                labelAlign: 'right',
                editable: false,
                valueField: '@class',
                hidden: me.ratioTypeOnly,
                readOnly: !me.editable,
                bind: {
                    value: '{clazz}'
                },
                store: {
                    type: 'store',
                    data: [{
                        '@class': 'com.hd123.m3.commons.biz.ratio.NormalRatio',
                        text: '固定比例'
                    }, {
                        '@class': 'com.hd123.m3.commons.biz.ratio.PieceRatio',
                        text: '分段比例'
                    }, {
                        '@class': 'com.hd123.m3.commons.biz.ratio.AbovePieceRatio',
                        text: '超额分段比例'
                    }]
                },
                listeners: {
                    change: function (field, value) {
                        if (value != me.getViewModel().get('ratio.@class')) {
                            me.setValue({
                                '@class': value
                            })
                        }
                    }
                }
            }, {
                xtype: 'numberfield',
                width: '80%',
                fieldLabel: '提成率（去税）',
                suffix: Ext.util.Format.percentSign,
                decimalPrecision: me.scale,
                labelAlign: 'right',
                allowBlank: me.allowBlank,
                readOnly: !me.editable,
                maxValue: 1,
                minValue: 0,
                hidden: true,
                bind: {
                    value: '{ratio.rateWithoutTax}',
                    hidden: '{!normalRateWithoutTax}'
                },
                listeners: {
                    change: function (field, value) {
                        if (value > 0) {
                            if (me.getViewModel().get('normalRateWithoutTax')) {
                                me.getViewModel().set('ratio.rate', Cxt.util.TaxCalculator.total(value, me.taxRate, me.scale, me.roundingMode));
                            }
                        }
                    }
                }
            }, {
                xtype: 'numberfield',
                width: '80%',
                fieldLabel: '提成率',
                suffix: Ext.util.Format.percentSign,
                decimalPrecision: me.scale,
                allowBlank: me.allowBlank,
                readOnly: !me.editable,
                labelAlign: 'right',
                maxValue: 1,
                minValue: 0,
                bind: {
                    value: '{ratio.rate}',
                    hidden: '{!isNormal}',
                    readOnly: '{normalRateReadOnly}'
                },
                listeners: {
                    change: function (field, value) {
                        if (value > 0) {
                            me.getViewModel().set('ratio.rate', Cxt.util.TaxCalculator.amount(value, me.taxRate, me.scale, me.roundingMode))
                        }
                    }
                }
            }, {
                xtype: 'grid',
                itemId: 'pieceratio',
                width: '100%',
                maxHeight: 400,
                autoAppend: false,
                columnLines: false,
                sortableColumns: false,
                store: {
                    type: 'store'
                },
                bind: {
                    store: {data: '{ratio.lines}'},
                    hidden: '{isNormal}'
                },
                plugins: {
                    ptype: 'cellediting',
                    clicksToEdit: 1,
                    listeners: {
                        beforeedit: Ext.bind(me.onBeforeEdit, me),
                        edit: Ext.bind(me.onCellEdit, me)
                    }
                },
                listeners: {
                    cellClick: Ext.bind(me.onCellClick, me)
                },
                columns: [{
                    dataIndex: 'low',
                    text: '金额下限',
                    flex: 1,
                    align: 'right',
                    renderer: Ext.util.Format.numberRenderer(',#.00'),
                    editor: {
                        xtype: 'numberfield',
                        allowBlank: false,
                        fieldStyle: 'text-align:right'
                    }
                }, {
                    dataIndex: 'high',
                    text: '金额上限（含）',
                    flex: 1,
                    align: 'right',
                    allowBlank: false,
                    renderer: function (v, metaData, record, rowIndex, colIndex, store) {
                        if (rowIndex == store.getData().length - 1) {
                            return '∞';
                        }
                        return Ext.util.Format.number(v, ',#.00');
                    },
                    editor: {
                        xtype: 'numberfield',
                        allowBlank: false,
                        maxValue: 99999999999.99,
                        fieldStyle: 'text-align:right'
                    }
                }, {
                    dataIndex: 'rateWithoutTax',
                    text: '提成率（去税）',
                    flex: 1,
                    align: 'right',
                    allowBlank: me.allowBlank,
                    renderer: Ext.util.Format.percentRenderer('#.######'),
                    bind: {
                        hidden: '{taxInclusive}'
                    },
                    editor: {
                        xtype: 'numberfield',
                        suffix: Ext.util.Format.percentSign,
                        decimalPrecision: me.scale,
                        allowBlank: me.allowBlank,
                        fieldStyle: 'text-align:right',
                        maxValue: 1,
                        minValue: 0
                    }
                }, {
                    dataIndex: 'rate',
                    text: '提成率',
                    flex: 1,
                    align: 'right',
                    allowBlank: me.allowBlank,
                    renderer: Ext.util.Format.percentRenderer('#.######'),
                    editor: {
                        xtype: 'numberfield',
                        suffix: Ext.util.Format.percentSign,
                        decimalPrecision: me.scale,
                        allowBlank: me.allowBlank,
                        fieldStyle: 'text-align:right',
                        maxValue: 1,
                        minValue: 0
                    }
                }, {
                    dataIndex: 'row',
                    text: '操作',
                    width: 100,
                    tdCls: 'x-grid-operate-cell',
                    hidden: !me.editable,
                    bind: {
                        hidden: '{term.formula.byYear}'
                    },
                    renderer: function (v, metaData, record, rowIndex) {
                        var details = me.getViewModel().get('ratio.lines'),
                            maxValue = 99999999999 - details.length + rowIndex + 2,
                            removable = !(me.authorized === false || rowIndex == 0 || rowIndex == details.length - 1) ? '' : 'disabled',
                            appendable = !(me.authorized === false || rowIndex == details.length - 1 || (record.get('high') >= maxValue)) ? '' : 'disabled';
                        return '<button ' + removable + (rowIndex == 0 || rowIndex == details.length - 1 ? '  style="color: transparent;"' : '') + '  class="fa fa-minus-circle removeItem"/><button ' + appendable + ' style="margin-left: 15px;' + (rowIndex == details.length - 1 ? 'color: transparent;' : '') + '" class="fa fa-plus-circle appendItem"/>'
                    }
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
                    hidden: !me.editable,
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

        me.getViewModel().set('editable', !!me.editable);
        me.setTaxInclusive(me.taxInclusive);
        if (me.ratioType) {
            me.setRatioType(me.ratioType);
        }
        if (me.value) {
            me.setValue(me.value);
        }
    },

    setValue: function (value) {
        var me = this;
        value = Ext.clone(Ext.valueFrom(value, {}));// 作为一个设置对话框，存在取消的风险，这边仅对value的备份进行后续的修改。

        Ext.applyIf(value, {
            '@class': 'com.hd123.m3.commons.biz.ratio.NormalRatio',
            rate: 0,
            rateWithoutTax: 0
        });

        if (value['@class'] != 'com.hd123.m3.commons.biz.ratio.NormalRatio') {
            value.lines = Ext.Array.from(value.lines);
            if (value.lines.length == 0) {
                value.lines.push({
                    low: 0, high: 1, rate: 0, rateWithoutTax: 0
                });
                value.lines.push({
                    low: 1, high: 99999999999.99, rate: 0, rateWithoutTax: 0
                });
            }
        }

        me.value = value;
        if (!me.rendered)
            return;
        me.getViewModel().set('ratio', value);
    },

    getValue: function () {
        var me = this;
        return me.getViewModel().get('ratio');
    },

    setTaxInclusive: function (taxInclusive) {
        var me = this;
        me.getViewModel().set('taxInclusive', taxInclusive);
    },

    setRatioType: function (ratioType) {
        var me = this;

        me.setValue({
            '@class': ratioType
        })
    },

    doConfirm: function () {
        var me = this;
        if (me.isValid() == false) {
            me.messagePanel.setMessages(me.getErrors());
            return;
        }

        me.fireEvent('change', me, me.getValue());
        me.close();
    },

    onBeforeEdit: function (editor, context) {
        var me = this,
            field = context.field,
            rowIdx = context.rowIdx,
            cellEditor = context.column.getEditor(),
            record = context.record,
            details = me.getViewModel().get('ratio.lines');
        if (!me.editable)
            return context.cancel = true;

        if (field == 'rate' && !me.getViewModel().get('taxInclusive')) {
            return context.cancel = true;
        } else if (field == 'low') {
            return context.cancel = true;
        } else if (field == 'high') {
            if (rowIdx == details.length - 1) {
                return context.cancel = true;
            }
            cellEditor.setMinValue(record.get('low'), false);
        }
    },

    onCellEdit: function (editor, context) {
        var me = this,
            record = context.record,
            grid = context.grid,
            field = context.field,
            cellEditor = context.column.getEditor(),
            details = me.getViewModel().get('ratio.lines');

        if (field == 'high') {
            if (cellEditor.getValue()) {
                me.calcNextLines(context.rowIdx + 1, details);
                grid.getStore().load();
            }
        } else if (field == 'rateWithoutTax') {
            record.set('rate', Cxt.util.TaxCalculator.total(record.get('rateWithoutTax'), me.taxRate, me.scale, me.roundingMode));
            if (record.get('rate') > 1) {
                record.set('rate', 1);
            }
        } else if (field == 'rate') {
            record.set('rateWithoutTax', Cxt.util.TaxCalculator.amount(record.get('rate'), me.taxRate, me.scale, me.roundingMode));
        }
    },

    onCellClick: function (grid, td, cellIndex, record, tr, rowIndex, e) {
        var me = this,
            details = me.getViewModel().get('ratio.lines'),
            appendButton = e.getTarget('.appendItem'),
            removeButton = e.getTarget('.removeItem');
        if (!appendButton && !removeButton) {// 判断是否有效点击
            return;
        }
        if (details.length - 1 == rowIndex) {
            return;
        }

        if (Ext.isEmpty(appendButton) == false) {
            //上一行的金额上限
            var rowIndexHigh = details[rowIndex].high;
            if (Ext.isEmpty(rowIndexHigh) || rowIndexHigh >= 99999999998.99) {
                return;
            }
            var appendObj = [{
                rate: 0,
                rateWithoutTax: 0,
                low: rowIndexHigh,
                high: rowIndexHigh + 1
            }];
            Ext.Array.insert(details, rowIndex + 1, appendObj);
            me.calcNextLines(rowIndex + 2, details);
        } else if (Ext.isEmpty(removeButton) == false) {
            if (0 == rowIndex) {
                return;
            }
            if (details[rowIndex + 1] && details[rowIndex - 1])
                details[rowIndex + 1].low = details[rowIndex - 1].high;
            Ext.Array.remove(details, details[rowIndex]);
        }
        grid.getStore().load();
    },

    calcNextLines: function (idx, details) {
        var index = idx;
        while (index < details.length) {
            details[index].low = details[index - 1].high;
            if (details[index].high >= details[index - 1].high + 1) {
                break;
            }
            details[index].high = details[index - 1].high + 1;
            index++;
        }
        index = details.length - 2;
        while (index > 0) {
            if (details[index].high > 99999999999.99) {
                if (!Ext.isEmpty(details[index + 1]))
                    details[index + 1].low = details[index].low;
                Ext.Array.remove(details, details[index]);
            } else {
                break;
            }
            index--;
        }
    }
});