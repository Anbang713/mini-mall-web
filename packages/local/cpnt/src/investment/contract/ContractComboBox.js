/**
 * 合同下拉选择控件
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.contract.ContractComboBox', {
    extend: 'Cxt.form.field.ComboGridBox',
    xtype: 'cpnt.investment.contract.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax',
        'Ext.util.Format'
    ],

    /**
     * @cfg {String/[String]} storeUuid
     * 项目限制。当storeLimit=true时，未设置storeUuid将无法查询数据
     */
    storeUuid: undefined,

    /**
     * 商户
     */
    tenantUuid: undefined,

    /**
     * @cfg {String} storeLimit
     * 项目限制，启用后未设置项目将无法查询合同
     */
    storeLimit: false,

    /**
     * @cfg {String} storeLimit
     * 商户限制，启用后未设置商户将无法查询合同
     */
    tenantLimit: false,

    /**
     * @cfg {String[]} states
     * 限制合同状态，可选值：ineffect(未生效);effect(已生效) ;
     * 默认为effect。
     */
    state: ['effect'],

    queryMode: 'remote',
    emptyText: '输入店招或合同编号',
    minChars: 1,
    queryParam: 'keyword',

    labelTpl: new Ext.XTemplate(
        '<tpl if="signboard">',
        '{signboard}[{serialNumber}]',
        '<tpl else>',
        '{serialNumber}',
        '</tpl>'
    ),

    valueField: 'uuid',
    valueParam: 'id',

    // forceSelection: true,
    //</locale>

    store: {
        type: 'store',
        pageSize: 10,
        remoteFilter: true,
        remoteSort: true,
        proxy: {
            type: 'ajax',
            url: 'api/invest/contract/query',
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
        },
        sorters: [{
            property: 'serialNumber',
            direction: 'DESC'
        }]
    },

    initComponent: function () {
        var me = this;
        me.grid = me.createGrid();
        me.callParent(arguments);

        me.getStore().on('beforeload', function () {
            if (!!me.storeLimit && Ext.isEmpty(me.storeUuid)) {
                me.getStore().removeAll();
                me.getStore().fireEvent('load', me.getStore());
                return false;
            }
            if (!!me.tenantLimit && Ext.isEmpty(me.tenantUuid)) {
                me.getStore().removeAll();
                me.getStore().fireEvent('load', me.getStore());
                return false;
            }
        });
    },

    createGrid: function () {
        var me = this;
        return {
            width: 560,
            columns: me.createColumns()
        };
    },

    createColumns: function () {
        return [{
            dataIndex: 'serialNumber',
            text: '合同编号',
            minWidth: 180,
            flex: 1
        }, {
            dataIndex: 'signboard',
            text: '店招',
            width: 120
        }, {
            dataIndex: 'contractPeriod',
            text: '合同周期',
            minWidth: 180,
            flex: 1,
            renderer: function (value, metaData, record) {
                var beginDate = record.get('beginDate'),
                    endDate = record.get('endDate');
                return Ext.util.Format.date(beginDate, "Y-m-d") + '~' + Ext.util.Format.date(endDate, "Y-m-d");
            }
        }]
    },

    setStoreUuid: function (storeUuid) {
        var me = this;
        if (me.storeUuid == storeUuid)
            return;
        me.storeUuid = storeUuid;
        delete me.lastQuery;
    },

    setTenantUuid: function (tenantUuid) {
        var me = this;
        if (me.tenantUuid == tenantUuid)
            return;
        me.tenantUuid = tenantUuid;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this,
            filter = {};
        Ext.apply(filter, {
            state: me.state,
            storeUuid: me.storeUuid,
            tenantUuid: me.tenantUuid
        });
        return filter;
    }
});