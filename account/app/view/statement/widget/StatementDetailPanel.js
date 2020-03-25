/**
 * Created by Administrator on 2020/3/25.
 */
Ext.define('account.view.statement.widget.StatementDetailPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'account.statement.detail.panel',

    requires: [
        'Ext.data.Store',
        'Ext.grid.column.RowNumberer',
        'Ext.util.Format'
    ],

    title: '结算明细',
    ui: 'primary',
    width: '100%',

    details: [],

    setDetails: function (details) {
        var me = this;
        me.details = details;
        me.getStore().getProxy().setData(me.details);
        me.getStore().setData(me.details);
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            sortableColumns: false,
            columnLines: true,
            columns: me.createColumns(),
            store: {type: 'store'},
            maxHeight: 500
        });
        me.callParent(arguments);
    },

    createColumns: function () {
        return [{
            xtype: 'rownumberer'
        }, {
            dataIndex: 'subject',
            text: '科目',
            width: 160,
            renderer: Ext.util.Format.ucnRenderer()
        }, {
            dataIndex: 'taxRate',
            text: '税率',
            width: 100,
            align: 'right',
            renderer: Ext.util.Format.percentRenderer(',#.##')
        }, {
            dataIndex: 'beginDate',
            text: '起始日期',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('Y-m-d')
        }, {
            dataIndex: 'endDate',
            text: '截止日期',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('Y-m-d')
        }, {
            dataIndex: 'total',
            text: '结算金额(税额)',
            width: 140,
            renderer: function (value, metaDate, record) {
                return Ext.util.Format.number(record.get('total'), ',#.00') + '(' + Ext.util.Format.number(record.get('tax'), ',#.00') + ')';
            }
        }, {
            dataIndex: 'salesTotal',
            text: '销售金额(税额)',
            minWidth: 140,
            flex: 1,
            renderer: function (value, metaDate, record) {
                return Ext.util.Format.number(record.get('salesTotal'), ',#.00') + '(' + Ext.util.Format.number(record.get('salesTax'), ',#.00') + ')';
            }
        }];
    }
});