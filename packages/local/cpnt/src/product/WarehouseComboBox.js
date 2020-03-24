/**
 * Created by Anbang713 on 2020/3/22.
 */
Ext.define('Cpnt.product.WarehouseComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.product.warehouse.combo',

    store: {
        data: [
            {'value': '北京仓库一', 'caption': '北京仓库一'},
            {'value': '北京仓库二', 'caption': '北京仓库二'},
            {'value': '北京仓库三', 'caption': '北京仓库三'},
            {'value': '上海仓库一', 'caption': '上海仓库一'},
            {'value': '上海仓库二', 'caption': '上海仓库二'},
            {'value': '广州仓库一', 'caption': '广州仓库一'},
            {'value': '深圳仓库一', 'caption': '深圳仓库一'}
        ]
    },

    queryMode: 'local',
    displayField: 'caption',
    valueField: 'value',
    editable: false
});