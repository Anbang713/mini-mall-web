/**
 * 楼宇下拉选择器
 * Created by mengyinkun on 2016/8/8.
 */
Ext.define('Cpnt.investment.building.BuildingComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.investment.building.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String} storeUuid
     * 项目限制。当storeLimit=true时，未设置storeUuid将无法查询数据
     */
    storeUuid: undefined,
    /**
     * @cfg {String} storeLimit
     * 项目限制，启用后未设置项目将无法查询楼宇
     */
    storeLimit: false,

    /**
     * @cfg {String[]} states
     * 状态限制
     * 可选值：using("使用中"), deleted("已删除")
     * 默认为using。
     */
    state: ['using'],

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',
    displayField: 'display',
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
        remoteSort: true,
        sorters: [{
            property: 'code',
            direction: 'ASC'
        }],
        proxy: {
            type: 'ajax',
            url: 'api/invest/building/query',
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

    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        me.getStore().on('beforeload', function () {
            if (!!me.storeLimit && !me.storeUuid) {
                me.getStore().removeAll();
                me.getStore().fireEvent('load', me.getStore());
                return false;
            }
        });
        me.getStore().on('load', function () {
            if (me.afterStoreLoad && Ext.isFunction(me.afterStoreLoad)) {
                me.afterStoreLoad(me);
            }
        });
    },

    setStoreUuid: function (storeUuid) {
        var me = this;
        if (me.storeUuid == storeUuid)
            return;
        me.storeUuid = storeUuid;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this;
        return {
            state: me.state,
            storeUuid: me.storeUuid
        };
    },

    afterStoreLoad: Ext.emptyFn

});