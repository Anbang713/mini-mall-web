/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.brand.widget.BrandCombo', {
    extend: 'Cxt.form.field.ComboGridBox',
    xtype: 'invest.brand.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax',
        'Ext.util.Format'
    ],

    queryMode: 'remote',
    minChars: 1,
    queryParams: 'keyword',
    displayField: 'code',
    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        pageSize: 10,
        proxy: {
            type: 'ajax',
            url: invest.view.brand.Brand.servicePath + '/query',
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
            property: 'code',
            direction: 'ASC'
        }]
    },
    grid: {
        width: 500,
        columns: [{
            dataIndex: 'code',
            text: '代码',
            width: 140
        }, {
            dataIndex: 'name',
            text: '名称',
            minWidth: 140,
            flex: 1
        }, {
            dataIndex: 'state',
            text: '状态',
            width: 100,
            renderer: Ext.util.Format.usingStateRenderer()
        }]
    }
});