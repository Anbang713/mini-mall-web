/**
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.sales.paymentType.PaymentTypeComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.sales.paymentType.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} states
     * 付款方式的状态。可选值：using，disabled。
     * 默认为using。
     */
    state: ['using'],

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',

    labelTpl: new Ext.XTemplate(
        '<tpl if="code">',
        '{name}[{code}]',
        '<tpl else>',
        '',
        '</tpl>'
    ),

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item ', Ext.baseCSSPrefix + 'overflow-ellipsis">{name}[{code}]</li>',
        '</tpl>'
    ),

    valueField: 'uuid',
    valueParam: 'id',

    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        sorters: [{
            property: 'code',
            direction: 'ASC'
        }],
        proxy: {
            type: 'ajax',
            url: 'api/sales/paymenttype/query',
            actionMethods: {
                read: 'POST'
            },
            startParam: '',
            paramsAsJson: true,
            extraParams: {},
            reader: {
                type: 'queryResult',
                rootProperty: 'records',
                totalProperty: 'recordCount'
            }
        }
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = Ext.Array.from(me.state);
        return filter;
    }
});