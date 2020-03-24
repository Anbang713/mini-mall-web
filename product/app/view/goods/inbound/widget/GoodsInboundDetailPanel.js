/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.widget.GoodsInboundDetailPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'product.goods.inbound.detail.panel',

    requires: [
        'Cpnt.product.GoodsComboBox',
        'Cpnt.product.GoodsSelectWindow',
        'Cxt.util.Toast',
        'Ext.button.Button',
        'Ext.data.Store',
        'Ext.form.field.Display',
        'Ext.form.field.Number',
        'Ext.grid.column.RowNumberer',
        'Ext.grid.plugin.CellEditing',
        'Ext.util.Format'
    ],

    title: '商品明细',
    ui: 'primary',
    width: '100%',

    editable: true,

    details: [],
    warehouse: undefined,

    setDetails: function (details) {
        var me = this;
        me.details = details;
        me.getStore().getProxy().setData(me.details);
        me.getStore().setData(me.details);
    },

    setWarehouse: function (warehouse) {
        var me = this;
        me.warehouse = warehouse;
        me.refreshToolBtns();
        me.refreshWarehouseQty();
    },

    refreshToolBtns: function () {
        var me = this;
        var selectBtn = me.down('#selectBtn'),
            settingBtn = me.down('#settingBtn');
        var warehouseIsEmpty = Ext.isEmpty(me.warehouse);
        if (selectBtn) {
            selectBtn.setDisabled(warehouseIsEmpty);
        }
        if (settingBtn) {
            settingBtn.setDisabled(warehouseIsEmpty);
        }
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            sortableColumns: false,
            columnLines: true,
            allowBlank: false,
            columns: me.createColumns(),
            store: {type: 'store'},
            header: {
                toolAlign: 'left'
            },
            tools: me.editable ? me.createTools() : [],
            maxHeight: 500,
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1,
                listeners: {
                    beforeedit: function (editor, context) {
                        if (me.editable == false) {
                            return context.cancel = true;
                        }
                        var field = context.field,
                            cellEditor = context.column.getEditor();
                        if (field == 'goods') {
                            if (Ext.isEmpty(me.warehouse)) {
                                return context.cancel = true;
                            }
                            cellEditor.setExpects(me.getExpects());
                        }
                    },
                    edit: function (editor, context) {
                        var field = context.field,
                            cellEditor = context.column.getEditor(),
                            record = context.record;
                        if (field == 'goods') {
                            var goods = cellEditor.getSelection() ? cellEditor.getSelection().getData() : null;
                            record.set('goods', goods);
                            record.set('goodsUuid', goods ? goods['uuid'] : undefined);
                            me.refreshWarehouseQty();
                        }
                    }
                }
            },
            listeners: {
                cellClick: Ext.bind(me.onCellClick, me)
            }
        });
        if (me.editable) {
            Ext.apply(me, {
                selType: 'checkboxmodel',
                selModel: {
                    mode: 'MULTI',
                    injectCheckbox: 0,
                    checkOnly: true
                }
            });
        }
        me.callParent(arguments);
    },

    createTools: function () {
        var me = this;
        return [{
            xtype: 'button',
            text: '批量添加商品',
            ui: 'link',
            iconCls: 'fa fa-file',
            disabled: true,
            itemId: 'selectBtn',
            listeners: {
                click: Ext.bind(me.doGoodsSelect, me)
            }
        }, {
            xtype: 'button',
            text: '删除',
            ui: 'danger',
            listeners: {
                click: Ext.bind(me.doGoodsDelete, me)
            }
        }, {
            xtype: 'displayfield',
            fieldLabel: '批量设置',
            margin: '0 0 0 10',
            padding: '3px',
            width: 60,
            itemId: 'settingLabel'
        }, {
            xtype: 'button',
            text: '入库数量',
            ui: 'link',
            itemId: 'settingBtn',
            disabled: true,
            listeners: {
                click: Ext.bind(me.settingBtnClick, me)
            }
        }, {
            xtype: 'numberfield',
            allowBlank: false,
            decimalPrecision: 0,
            minValue: 0,
            margin: '0 0 0 10',
            minEquals: false,
            hidden: true,
            fieldStyle: 'text-align:right',
            itemId: 'quantityField',
            renderer: Ext.util.Format.numberRenderer(',#.00'),
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                decimalPrecision: 2,
                minValue: 0,
                minEquals: false,
                fieldStyle: 'text-align:right'
            }
        }, {
            xtype: 'button',
            ui: 'link',
            hidden: true,
            text: '确定',
            itemId: 'confirmBtn',
            listeners: {
                click: Ext.bind(me.onChangeBatch2Confirm, me)
            }
        }, {
            xtype: 'button',
            ui: 'link',
            hidden: true,
            text: '取消',
            itemId: 'cancelBtn',
            listeners: {
                click: Ext.bind(me.onChangeBatch2Cancel, me)
            }
        }];
    },

    doGoodsSelect: function () {
        var me = this;
        if (Ext.isEmpty(me.warehouse)) {
            return;
        }
        me.window = Ext.create({
            xtype: 'cpnt.product.goods.select.window',
            belongTo: me,
            expects: me.getExpects()
        });
        me.window.on('select', function (window, selections) {
            me.clearBlankDetails(me.details);
            var details = [];
            Ext.Array.each(selections, function (selection) {
                Ext.Array.push(details, {
                    goods: selection,
                    goodsUuid: selection['uuid']
                });
            });
            Ext.Array.push(me.details, details);
            me.refreshWarehouseQty();
        });
        me.window.show();
    },

    doGoodsDelete: function () {
        var me = this,
            selections = me.getSelection();
        if (Ext.isEmpty(selections)) {
            return Cxt.util.Toast.warning("请先选择需要批量删除的明细！");
        }
        var removed = [];
        Ext.Array.each(selections, function (selection) {
            Ext.Array.each(me.details, function (detail) {
                if (selection.get('id') == detail['id']) {
                    Ext.Array.push(removed, detail);
                }
            });
        });
        if (Ext.isEmpty(removed)) {
            return;
        }
        Ext.Array.remove(me.details, removed);
        if (Ext.isEmpty(me.details)) {
            Ext.Array.push(me.details, [{}]);
        }
        me.getStore().getProxy().setData(me.details);
        me.getStore().setData(me.details);
    },

    clearBlankDetails: function (details) {
        var isRemoved = false;
        for (var i = details.length - 1; i >= 0; i--) {
            var detail = details[i];
            if (detail['goodsUuid']) {
                isRemoved = true;
            } else {
                if (!isRemoved) {
                    Ext.Array.remove(details, detail);
                }
            }
        }
    },

    settingBtnClick: function () {
        var me = this,
            selections = me.getSelection();
        if (Ext.isEmpty(selections)) {
            return Cxt.util.Toast.warning("请先选择需要批量设置入库数量的明细！");
        }
        me.down('#settingLabel').setHidden(true);
        me.down('#settingBtn').setHidden(true);

        var quantityField = me.down('#quantityField');
        quantityField.setHidden(false);
        quantityField.markInvalid(null);

        me.down('#confirmBtn').setHidden(false);
        me.down('#cancelBtn').setHidden(false);
    },

    onChangeBatch2Confirm: function () {
        var me = this,
            selections = me.getSelection();
        if (Ext.isEmpty(selections)) {
            return Cxt.util.Toast.warning("请先选择需要批量设置入库数量的明细！");
        }
        var field = me.down('#quantityField');
        var isValid = field.isValid();
        if (isValid == false) {
            return;
        }
        var value = field.getValue();
        me.onChangeBatch2Cancel();
        Ext.Array.each(selections, function (selection) {
            selection.set('quantity', value);
        });
    },

    onChangeBatch2Cancel: function () {
        var me = this;

        if (me.editable == false) {
            return;
        }

        me.down('#settingLabel').setHidden(false);
        me.down('#settingBtn').setHidden(false);

        var quantityField = me.down('#quantityField');

        quantityField.setHidden(true);
        quantityField.setValue(null);
        quantityField.markInvalid(null);

        me.down('#confirmBtn').setHidden(true);
        me.down('#cancelBtn').setHidden(true);
    },

    createColumns: function () {
        var me = this,
            columns = [{
                xtype: 'rownumberer'
            }, {
                dataIndex: 'goods',
                text: '商品',
                minWidth: 240,
                flex: 1,
                allowBlank: me.editable == false,
                renderer: Ext.util.Format.ucnRenderer(),
                editor: {
                    xtype: 'cpnt.product.goods.combo'
                }
            }, {
                dataIndex: 'warehouseQty',
                text: '库存数量',
                width: 120
            }, {
                dataIndex: 'quantity',
                text: '入库数量',
                width: 120,
                align: 'right',
                allowBlank: me.editable == false,
                renderer: Ext.util.Format.numberRenderer(',#'),
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 0,
                    minValue: 0,
                    minEquals: false,
                    fieldStyle: 'text-align:right'
                }
            }, {
                dataIndex: 'afterInbound',
                text: '入库后数量',
                width: 120,
                align: 'right',
                renderer: function (value, metaData, record) {
                    var warehouseQty = record.get('warehouseQty'),
                        quantity = record.get('quantity');
                    if (Ext.isEmpty(warehouseQty) || Ext.isEmpty(quantity)) {
                        return;
                    }
                    return Ext.util.Format.number(warehouseQty.add(quantity), ',#');
                }
            }];

        if (me.editable) {
            Ext.Array.push(columns, {
                dataIndex: 'row',
                text: '操作',
                width: 100,
                tdCls: 'x-grid-operate-cell',
                renderer: function () {
                    return '<button class="action-remove"/><button class="action-append"/>';
                }
            });
        }
        return columns;
    },

    onCellClick: function (grid, td, cellIndex, record, tr, rowIndex, e) {
        var me = this;
        if (e.getTarget('.action-append')) {
            Ext.Array.insert(me.details, rowIndex + 1, [{}]);
            me.getStore().getProxy().setData(me.details);
            me.getStore().setData(me.details);
        } else if (e.getTarget('.action-remove')) {
            var removed = me.details[rowIndex];
            Ext.Array.remove(me.details, removed);
            if (Ext.isEmpty(me.details)) {
                Ext.Array.push(me.details, [{}]);
            }
            me.getStore().getProxy().setData(me.details);
            me.getStore().setData(me.details);
        }
    },

    getExpects: function () {
        var me = this,
            goodsUuids = [];
        Ext.Array.each(me.details, function (detail) {
            if (Ext.isEmpty(detail) == false && Ext.isEmpty(detail['goodsUuid']) == false) {
                goodsUuids.push(detail['goodsUuid']);
            }
        });
        return goodsUuids;
    },

    refreshWarehouseQty: function () {
        var me = this;

        var goodsUuids = [];
        Ext.Array.each(me.details, function (detail) {
            if (Ext.isEmpty(detail['goodsUuid']) == false) {
                Ext.Array.push(goodsUuids, 'mall:product:goods:' + detail['goodsUuid']);
            }
        });
        if (Ext.isEmpty(goodsUuids)) {
            return;
        }

        var deferred = Ext.create('Ext.Deferred');

        Ext.Ajax.request({
            url: 'api/basis/stock/stockInfos',
            failureToast: true,
            waitMsg: '正在查询商品库存...',
            jsonData: goodsUuids
        }).then(function (response) {
            var result = Ext.JSON.decode(response.responseText, true);
            Ext.Array.each(me.details, function (detail) {
                if (Ext.isEmpty(detail['goodsUuid']) == false) {
                    var stockInfo = result['mall:product:goods:' + detail['goodsUuid']];
                    if (Ext.isEmpty(stockInfo)) {
                        detail['warehouseQty'] = 0;
                    } else {
                        var warehouseInfos = stockInfo['warehouseInfos'];
                        if (Ext.isEmpty(warehouseInfos)) {
                            detail['warehouseQty'] = 0;
                        } else {
                            var qty = 0;
                            Ext.Array.each(warehouseInfos, function (warehouseInfo) {
                                if (warehouseInfo['warehouse'] == me.warehouse) {
                                    qty = warehouseInfo['quantity'];
                                    return false;
                                }
                            });
                            detail['warehouseQty'] = qty;
                        }
                    }
                }
            });
            // 刷新表格
            me.getStore().getProxy().setData(me.details);
            me.getStore().setData(me.details);
            deferred.resolve(response.responseText);
        });
        return deferred.promise;
    }
});