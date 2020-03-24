/**
 * 是否的选择控件
 * Created by lzy on 2016/10/14.
 */
Ext.define('Cxt.form.field.BooleanComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'booleancombo',

    store: {
        data: [
            {'value': true, 'caption': '是'},
            {'value': false, 'caption': '否'}
        ]
    },

    queryMode: 'local',
    displayField: 'caption',
    valueField: 'value',
    editable: false
});