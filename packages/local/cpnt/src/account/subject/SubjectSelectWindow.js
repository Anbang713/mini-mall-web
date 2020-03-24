/**
 * 提供科目的批量选择对话框
 *
 * Created by cRazy on 2016/10/27.
 */
Ext.define('Cpnt.account.subject.SubjectSelectWindow', {
    extend: 'Cpnt.window.MultiSelectWindow',
    xtype: 'cpnt.account.subject.select.window',

    requires: [
        'Ext.form.field.Text'
    ],

    title: '选择科目',

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
     * @cfg {int} direction
     * 收付方向。可选值：-1（付）；1（收）
     * 默认为undefined。
     */
    direction: undefined,

    /**
     * @cfg {String[]} direction
     * 科目用途。可选值：‘fixedRent, saleDeduct, salePayment, tempFee, fixedFee, creditDeposit, margin, other。
     * 默认为undefined。
     */
    usageType: undefined,

    conditions: [{
        xtype: 'textfield',
        fieldName: 'keyword',
        fieldLabel: '科目',
        emptyText: '请输入代码/名称',
        labelWidth: 80
    }],

    columns: [{
        dataIndex: 'code',
        text: '代码',
        flex: 1
    }, {
        dataIndex: 'name',
        text: '名称',
        flex: 1
    }],

    queryUrl: 'account/subject/query.hd',
    sorters: [{
        property: 'code',
        direction: 'ASC'
    }],

    supplyFilter: function () {
        var me = this,
            filter = me.callParent(arguments);

        filter.state = me.state;

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
        me.direction = direction;
        delete me.lastQuery;
    },

    setSelections: function (selections) {
        var me = this;
        me.selections = [];
        if (Ext.isEmpty(selections) == false) {
            me.selections = selections;
        }
    }
});