/**
 * Created by lizhen on 2018/3/7.
 */
Ext.define('Cpnt.investment.contract.ContractMultiComboBox', {
    extend: 'Cxt.form.field.MultiTagField',
    xtype: 'cpnt.investment.contract.multi.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax'
    ],


    /**
     * @cfg {String[]} states
     * 限制合同状态，可选值：ineffect(未生效);effect(已生效) ;stopped(已终止);finished(已结束);canceled(已作废);
     * 默认为using。
     */
    state: [],

    /**
     * 限制位置类型
     */
    positionType: undefined,

    /**
     * @cfg {[String]} contractType,可以字符串也可以是字符窜数组
     * 合同类型，tenant/proprietor/lessee
     */
    contractType: ['tenant', 'lessee'],

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
        '<tpl if="code">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item">{name}[{code}]</li>',
        '<tpl else>',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item">{name}</li>',
        '</tpl>',
        '</tpl>'
    ),


    valueField: 'uuid',
    valueParam: 'id',

    store: {
        type: 'store',
        pageSize: 0,
        remoteFilter: true,
        proxy: {
            type: 'ajax',
            url: 'investment/contract/query.hd',
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
            property: 'code',
            direction: 'Desc'
        }]
    },

    setContractType: function (contractType) {
        var me = this;
        if (me.contractType == contractType)
            return;
        me.contractType = contractType;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = me.state;
        filter.positionType=me.positionType;
        filter.contractType=me.contractType;
        return filter;
    }

    });