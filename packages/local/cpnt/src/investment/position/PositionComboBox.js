/**
 * 位置下拉表格选项框
 * Created by chenganbang on 2016/9/13.
 */
Ext.define('Cpnt.investment.position.PositionComboBox', {
    extend: 'Cxt.form.field.ComboGridBox',
    xtype: 'cpnt.investment.position.combo',

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
     * @cfg {String} storeLimit
     * 楼宇限制，启用后未设置楼宇将无法查询楼层
     */
    buildingLimit: false,

    buildingUuid: undefined,

    /**
     * @cfg {String} floorLimit
     * 楼层限制，启用后未设置楼层将无法查询楼层
     */
    floorLimit: false,

    floorUuid: undefined,

    /**
     * @cfg {String[]} states
     * 位置状态限制
     * 可选值：using("使用中"), disabled("已停用");
     * 默认为using。
     */
    state: ['using'],

    url: 'api/invest/position/query',

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',
    valueField: 'uuid',
    valueParam: 'id',

    labelTpl: new Ext.XTemplate(
        '<tpl if="name">',
        '{name}[{code}]',
        '<tpl elseif="code">',
        '-[{code}]',
        '<tpl else>',
        '',
        '</tpl>'
    ),

    createColumns: function () {
        return [{
            scroll: true,
            dataIndex: 'code',
            text: '代码',
            flex: 1
        }, {
            dataIndex: 'name',
            text: '名称',
            flex: 1
        }];
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            grid: {
                width: 550,
                columns: me.createColumns()
            },
            store: {
                type: 'store',
                remoteFilter: true,
                remoteSort: true,
                pageSize: 10,
                sorters: [{
                    property: 'code',
                    direction: 'ASC'
                }],
                proxy: {
                    type: 'ajax',
                    url: me.url,
                    limitParam: 'pageSize',
                    pageParam: 'page',
                    startParam: '',
                    paramsAsJson: true,
                    extraParams: {},
                    actionMethods: {
                        read: 'POST'
                    },
                    reader: {
                        type: 'queryResult',
                        rootProperty: 'records',
                        totalProperty: 'recordCount'
                    }
                }
            }
        });
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
            if (!!me.floorLimit && !me.floorUuid) {
                me.getStore().removeAll();
                me.getStore().fireEvent('load', me.getStore());
                return false;
            }
        });
    },

    setStoreUuid: function (storeUuid) {
        var me = this;
        me.storeUuid = storeUuid;
        delete me.lastQuery;
    },

    setBuildingUuid: function (buildingUuid) {
        var me = this;
        me.buildingUuid = buildingUuid;
        delete me.lastQuery;
    },

    setFloorUuid: function (floorUuid) {
        var me = this;
        me.floorUuid = floorUuid;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this;
        return {
            state: me.state,
            storeUuid: me.storeUuid,
            buildingUuid: me.buildingUuid,
            floorUuid: me.floorUuid
        };
    },

    createPicker: function () {
        var me = this;
        Ext.apply(me, {
            listConfig: {
                fbar: [{
                    xtype: 'button',
                    text: '新建铺位',
                    handler: function () {
                        Cxt.util.Window.open('../invest/index.html#invest.position', {
                            node: 'create'
                        });
                    }
                }]
            }
        });

        return me.callParent(arguments);
    }
});
