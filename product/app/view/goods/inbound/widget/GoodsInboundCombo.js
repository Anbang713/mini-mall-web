/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.widget.GoodsInboundCombo', {
    extend: 'Cxt.form.field.ComboGridBox',
    xtype: 'product.goods.inbound.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax',
        'Ext.util.Format',
        'product.view.goods.inbound.GoodsInbound'
    ],

    queryMode: 'remote',
    minChars: 1,
    queryParams: 'keyword',
    displayField: 'billNumber',
    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        pageSize: 10,
        proxy: {
            type: 'ajax',
            url: product.view.goods.inbound.GoodsInbound.servicePath + '/query',
            actionMethods: {
                read: 'POST'
            },
            limitParam: 'pageSize',
            pageParam: 'page',
            startParam: '',
            paramsAsJson: true,
            extraParams: {},
            reader: {
                type: 'queryResult',
                rootProperty: 'records',
                totalProperty: 'recordCount'
            }
        },
        sorters: [{
            property: 'billNumber',
            direction: 'ASC'
        }]
    },
    grid: {
        width: 500,
        columns: [{
            dataIndex: 'billNumber',
            text: '单号',
            minWidth: 140,
            flex: 1
        }, {
            dataIndex: 'state',
            text: '状态',
            width: 100,
            renderer: Ext.util.Format.bizStateRenderer()
        }, {
            dataIndex: 'inboundDate',
            text: '入库日期',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('Y-m-d')
        }]
    }
});