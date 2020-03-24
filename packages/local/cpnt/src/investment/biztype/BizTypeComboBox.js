/**
 * 业态下拉选择框
 *
 * Created by libin on 2016/10/9.
 */
Ext.define('Cpnt.investment.biztype.BizTypeComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.investment.biztype.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} state
     * 状态。可选值：using，disabled。
     * 默认为using。
     */
    state: ['using'],

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',
    valueField: 'uuid',
    valueParam: 'id',

    pageSize: 10,

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

    store: {
        type: 'store',
        remoteFilter: true,
        sorters: [{
            property: 'code',
            direction: 'ASC'
        }],
        proxy: {
            type: 'ajax',
            url: 'api/invest/biztype/query',
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
        }
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = me.state;
        return filter;
    }
});