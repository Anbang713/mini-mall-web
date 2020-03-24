/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('sales.view.paymenttype.edit.PaymentTypeEditController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.sales.paymenttype.edit',

    requires: [
        'Cxt.util.Window'
    ],

    doSave: function () {
        var me = this,
            view = me.getView(),
            entity = view.getViewModel().get('entity');
        if (!view.isValid()) {
            return;
        }
        sales.view.paymenttype.PaymentTypeService.save(entity);
    },

    doCancel: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        var cancelMsg = "确定要取消新建吗？";

        if (!Ext.isEmpty(entity.uuid)) {
            cancelMsg = "确定要取消编辑吗？";
        }
        Ext.Msg.confirm("提示", cancelMsg, function (success) {
            if (success == 'yes' && Cxt.util.Window.back() === false) {
                Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'search', {localSearch: true});

            }
        });
    }
});