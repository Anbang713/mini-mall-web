/**
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.tenant.TenantComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.investment.tenant.combo',

    requires: [
        'Cxt.button.AuthorButton',
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Window',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} states
     * 状态。可选值：using，deleted。
     * 默认为using。
     */
    state: ['using'],

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',
    valueField: 'uuid',
    displayField: 'name',
    valueParam: 'id',
    pageSize: 10,

    labelTpl: new Ext.XTemplate(
        '<tpl if="code">',
        '{name}[{code}]',
        '<tpl else>',
        '{name}',
        '</tpl>'
    ),
    // should be setting aria-posinset based on entire set of data
    // not filtered set
    tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item ', Ext.baseCSSPrefix + 'overflow-ellipsis">{name}[{code}]</li>',
        '</tpl>'
    ),

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
            url: 'api/invest/tenant/query',
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
            xtype: 'authorbutton',
            text: '新建商户',
            bind: {
                authorization: '{createAuth}'
            },
            handler: function () {
                Cxt.util.Window.open('../invest/index.html#invest.tenant', {
                    node: 'create'
                });
            }
        }]
    }
});