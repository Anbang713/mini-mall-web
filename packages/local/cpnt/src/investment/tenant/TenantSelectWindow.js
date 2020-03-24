/**
 * 商户选择window
 * Created by chenganbang on 2018/3/8.
 */
Ext.define('Cpnt.investment.tenant.TenantSelectWindow', {
    extend: 'Cpnt.window.MultiSelectWindow',
    xtype: 'cpnt.investment.tenant.select.window',

    requires: [
        'Ext.form.field.Text'
    ],

    width: 800,
    title: '批量选择商户',
    queryUrl: 'investment/tenant/merchant/query.hd',
    sorters: [{
        property: 'tenant',
        direction: 'ASC'
    }],

    /**
     * @cfg {Boolean} locker
     * 是否锁定，true表示锁定;false表示非锁定
     */
    locker: undefined,

    /**
     * @cfg {String[]} states
     * 状态限制
     * 可选值：using("使用中"), deleted("已删除");
     * 默认为using。
     */
    state: ['using'],

    /**
     * 列，使用者可以根据实际情况自行编码
     */
    columns: [{
        dataIndex: 'tenant',
        text: '商户',
        minWidth: 200,
        flex: 1,
        renderer: function (value, metaData, record) {
            return record.get('name') + '[' + record.get('code') + ']';
        }
    }, {
        dataIndex: 'shortName',
        text: '简称',
        width: 200
    }, {
        dataIndex: 'uscc',
        text: '统一社会信用代码',
        width: 200
    }],

    conditions: [{
        xtype: 'textfield',
        fieldName: 'keyword',
        fieldLabel: '商户',
        emptyText: '代码/名称',
        columnWidth: 0.33,
        labelWidth: 75
    }, {
        xtype: 'textfield',
        fieldLabel: '简称',
        fieldName: 'shortName',
        columnWidth: 0.33,
        labelWidth: 75
    }],

    supplyFilter: function () {
        var me = this,
            filter = me.callParent(arguments);

        if (me.state) {
            filter.state = me.state;
        }

        if (Ext.isEmpty(me.locker) == false) {
            filter.locker = me.locker;
        }
        return filter;
    }
});