/**
 * 科目多选下拉框
 *
 * Created by libin on 2016/9/6.
 */
Ext.define('Cpnt.account.subject.SubjectMultiComboBox', {
    extend: 'Cxt.form.field.MultiTagField',
    xtype: 'cpnt.account.subject.multi.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} expects
     * 过滤科目，不能超过1000个
     */
    expects: [],

    /**
     * @cfg {String[]} state
     * 科目状态。可选值：enabled，disabled。
     * 默认为enabled。
     */
    state: ['enabled'],

    /**
     * @cfg {String} subjectType
     * 科目状态。可选值：credit，predeposit。
     * 默认为undefined。
     */
    subjectType: undefined,
    /**
     * @cfg {String} direction
     * 收付方向。可选值：‘-1’，‘1’。
     * 默认为undefined。
     */
    direction: undefined,

    /**
     * @cfg {String[]} usageType
     * 科目用途。可选值：‘fixedRent, saleDeduct, salePayment, tempFee, fixedFee, creditDeposit, margin, other。
     * 默认为undefined。
     */
    usageType: undefined,

    /**
     * @cfg {String[]} fetchParts
     * 科目用途。可选值：storeTaxRates。
     */

    //</locale>
    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',
    pageSize: 10,

    labelTpl: new Ext.XTemplate(
        '<tpl if="name">',
        '{name}',
        '<tpl else>',
        '',
        '</tpl>'
    ),

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<tpl if="code">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item ', Ext.baseCSSPrefix + 'overflow-ellipsis">{name}[{code}]</li>',
        '<tpl else>',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item">{name}</li>',
        '</tpl>',
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
            url: 'account/subject/query.hd',
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
    },

    initComponent: function () {
        var me = this;
        me.srcUsageType = me.usageType;// 用于sameUsageType
        me.callParent(arguments);
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = me.state;
        filter.expects = me.expects;

        if (me.fetchParts) {
            filter.fetchParts = me.fetchParts.join(',');
        }
        if (me.subjectType)
            filter.subjectType = me.subjectType;
        if (me.direction)
            filter.direction = me.direction;
        if (me.usageType)
            filter.usageType = me.usageType;
        return filter;
    },

    setDirection: function (direction) {
        var me = this;
        if (direction && me.direction == direction)
            return;
        me.direction = direction;
        delete me.lastQuery;
    },

    setUsageType: function (usageType) {
        var me = this;
        usageType = Ext.Array.from(usageType);
        if (Ext.Array.equals(me.usageType, usageType))
            return;
        me.usageType = usageType;
        me.srcUsageType = usageType;// 用于sameUsageType
        delete me.lastQuery;
    },

    setExpects: function (expects) {
        var me = this;
        if (Ext.Array.equals(me.expects, expects))
            return;

        me.expects = Ext.Array.from(expects);
        delete me.lastQuery;
    }
});