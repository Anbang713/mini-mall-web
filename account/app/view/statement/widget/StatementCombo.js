/**
 * Created by Administrator on 2020/3/25.
 */
Ext.define('account.view.statement.widget.StatementCombo', {
    extend: 'Cxt.form.field.ComboGridBox',
    xtype: 'account.statement.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax',
        'Ext.util.Format'
    ],

    queryMode: 'remote',
    minChars: 1,
    queryParams: 'keyword',
    displayField: 'billNumber',
    fetchParts: ['store'],
    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        pageSize: 10,
        proxy: {
            type: 'ajax',
            url: account.view.statement.Statement.servicePath + '/query',
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
            dataIndex: 'store',
            text: '项目',
            width: 120,
            renderer: Ext.util.Format.ucnRenderer()
        }]
    }
});