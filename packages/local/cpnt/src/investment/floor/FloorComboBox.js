/**
 * Created by mengyinkun on 2016/9/10.
 */
Ext.define('Cpnt.investment.floor.FloorComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.investment.floor.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.data.proxy.Ajax'
    ],


    /**
     * 项目限制。当storeLimit=true时，未设置storeUuid将无法查询数据
     */
    storeUuid: undefined,
    /**
     * @cfg {String} storeLimit
     * 项目限制，启用后未设置项目将无法查询楼层
     */
    storeLimit: false,

    /**
     * 楼宇限制。当buildingLimit=true时，未设置buildingUuid将无法查询数据
     */
    buildingUuid: undefined,
    /**
     * @cfg {String} storeLimit
     * 楼宇限制，启用后未设置项目将无法查询楼层
     */
    buildingLimit: false,

    /**
     * @cfg {String[]} states
     * 位置状态限制
     * 可选值：using("使用中"), deleted("已删除")
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
        remoteSort: true,
        sorters: [{
            property: 'code',
            direction: 'ASC'
        }],
        proxy: {
            type: 'ajax',
            url: 'api/invest/floor/query',
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
            text: '新建楼层',
            handler: function () {
                Cxt.util.Window.open('../invest/index.html#invest.floor', {
                    node: 'create'
                });
            }
        }]
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
            if (!!me.buildingLimit && !me.buildingUuid) {
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

    setBuildingUuid: function (buildingUuid) {
        var me = this;
        if (me.buildingUuid == buildingUuid)
            return;
        me.buildingUuid = buildingUuid;
        delete me.lastQuery;
    },

    setStoreUuid: function (storeUuid) {
        var me = this;
        if (me.storeUuid == storeUuid)
            return;
        me.storeUuid = storeUuid;
        delete me.lastQuery;
    },

    /**
     * 设置storeLimit，不影响现有数据，仅对下次查询有效。
     * @param storeLimit
     */
    setStoreLimit: function (storeLimit) {
        var me = this;
        if (me.storeLimit == storeLimit)
            return;
        me.storeLimit = storeLimit;
        delete me.lastQuery;
    },

    setBuildingLimit: function (buildingLimit) {
        var me = this;
        if (me.buildingLimit == buildingLimit)
            return;
        me.buildingLimit = buildingLimit;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = me.state;
        if (me.storeLimit || me.storeUuid) {// 限制项目
            filter.storeUuid = me.storeUuid;
        }
        if (me.buildingLimit || me.buildingUuid) {// 限制楼宇
            filter.buildingUuid = me.buildingUuid;
        }
        if (me.fetchParts) {
            filter.fetchParts = me.fetchParts;
        }
        return filter;
    },

    afterStoreLoad: Ext.emptyFn
});