/**
 * Created by Administrator on 2020/3/25.
 */
Ext.define('account.view.statement.widget.StatementPayStateCombo', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'account.statement.pay.state.combo',

    store: {
        data: [
            {'value': 'unPay', 'caption': '未收款'},
            {'value': 'payed', 'caption': '已收款'}
        ]
    },

    queryMode: 'local',
    displayField: 'caption',
    valueField: 'value',
    editable: false
});