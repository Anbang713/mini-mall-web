/**
 * Created by Anbang713 on 2020/3/22.
 */
Ext.define('Cpnt.product.GoodsComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.product.goods.combo',

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

    /**
     * 排除指定uuid的商品
     */
    expects: [],

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
            url: 'api/product/goods/query',
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
            text: '新建商品',
            handler: function () {
                Cxt.util.Window.open('../product/index.html#product.goods', {
                    node: 'create'
                });
            }
        }]
    },

    setExpects: function (expects) {
        var me = this;
        me.expects = expects;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = Ext.Array.from(me.state);
        if (Ext.isEmpty(me.expects) == false) {
            filter.expects = me.expects;
        }
        return filter;
    }
});