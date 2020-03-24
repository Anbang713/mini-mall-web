/**
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.store.StoreComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.investment.store.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} states
     * 项目状态。可选值：using，disabled。
     * 默认为using。
     */
    state: ['using'],

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',
    displayField: 'name',
    pageSize: 10,

    labelTpl: new Ext.XTemplate(
        '<tpl if="code">',
        '{name}[{code}]',
        '<tpl else>',
        '{name}',
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
            url: 'api/invest/store/query',
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

    listConfig: {
        fbar: [{
            xtype: 'button',
            text: '新建项目',
            handler: function () {
                Cxt.util.Window.open('../invest/index.html#invest.store', {
                    node: 'create'
                });
            }
        }]
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = Ext.Array.from(me.state);
        return filter;
    }
});