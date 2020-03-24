/**
 * Created by Anbang713 on 2020/3/22.
 */
Ext.define('Cpnt.product.GoodsSelectWindow', {
    extend: 'Cpnt.window.MultiSelectWindow',
    xtype: 'cpnt.product.goods.select.window',

    requires: [
        'Ext.form.field.Text'
    ],


    title: '选择商品',

    /**
     * @cfg {String[]} state
     * 状态。可选值：using，disabled。
     * 默认为using。
     */
    state: ['using'],

    conditions: [{
        xtype: 'textfield',
        fieldName: 'keyword',
        fieldLabel: '关键字',
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

    queryUrl: 'api/product/goods/query',
    sorters: [{
        property: 'code',
        direction: 'ASC'
    }],

    supplyFilter: function () {
        var me = this,
            filter = me.callParent(arguments);
        filter.state = me.state;
        return filter;
    }
});