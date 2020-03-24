/**
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.brand.BrandComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.investment.brand.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} states
     * 状态。可选值：using，disabled。
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
            url: 'api/invest/brand/query',
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
            text: '新建品牌',
            handler: function () {
                Cxt.util.Window.open('../invest/index.html#invest.brand', {
                    node: 'create'
                });
            }
        }]
    },

    buildFilter: function () {
        var me = this, filter = {};
        if (me.state) {
            filter.state = Ext.Array.from(me.state);
        }
        return filter;
    },

    setState: function (state) {
        this.state = state;
        delete this.lastQuery;
    }
});