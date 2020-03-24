/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.contract.widget.ContractCombo', {
    extend: 'Cxt.form.field.ComboGridBox',
    xtype: 'invest.contract.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax',
        'Ext.util.Format'
    ],

    queryMode: 'remote',
    minChars: 1,
    queryParams: 'keyword',
    displayField: 'code',
    fetchParts: ['store'],
    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        pageSize: 10,
        proxy: {
            type: 'ajax',
            url: invest.view.contract.Contract.servicePath + '/query',
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
            property: 'serialNumber',
            direction: 'ASC'
        }]
    },
    grid: {
        width: 600,
        columns: [{
            dataIndex: 'serialNumber',
            text: '合同编号',
            width: 120
        }, {
            dataIndex: 'signboard',
            text: '店招',
            minWidth: 120,
            flex: 1
        }, {
            dataIndex: 'store',
            text: '项目',
            minWidth: 120,
            renderer: Ext.util.Format.ucnRenderer()
        }, {
            dataIndex: 'dateRange',
            text: '合同期',
            width: 140,
            renderer: function (value, metaData, record) {
                var dateRange = {
                    beginDate: record.get('beginDate'),
                    endDate: record.get('endDate')
                };
                return Ext.util.Format.dateRange(dateRange);
            }
        }, {
            dataIndex: 'state',
            text: '状态',
            width: 80,
            renderer: Ext.util.Format.bizStateRenderer()
        }]
    }
});