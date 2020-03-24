/**
 * 项目多选
 *
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.store.StoreMultiTagField', {
    extend: 'Cxt.form.field.MultiTagField',
    xtype: 'cpnt.investment.store.multi',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} states
     * 项目状态。可选值：using，deleted。
     * 默认为using。
     */
    state: ['using'],

    upperId: undefined,

    //</locale>
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
    // should be setting aria-posinset based on entire set of data
    // not filtered set
    tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item ', Ext.baseCSSPrefix + 'overflow-ellipsis">{name}[{code}]</li>',
        '</tpl>'
    ),

    valueField: 'uuid',
    valueParam: 'id',

    // forceSelection: true,
    //</locale>

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
            url: 'investment/store/query.hd',
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
                Cxt.util.Window.open('../invest/index.html#invest.largeproperty', {
                    node: 'storeCreate'
                });
            }
        }]
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = Ext.Array.from(me.state);
        filter.upperId = me.upperId;
        if (Ext.isEmpty(me.fetchParts) == false) {
            filter.fetchParts = me.fetchParts.join(',');
        }
        return filter;
    }
});