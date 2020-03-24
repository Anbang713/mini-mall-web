/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.edit.GoodsInboundEditController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.product.goods.inbound.edit',

    requires: [
        'Cxt.util.Window',
        'product.view.goods.inbound.GoodsInbound',
        'product.view.goods.inbound.GoodsInboundService'
    ],

    doSave: function () {
        var me = this,
            view = me.getView(),
            entity = view.getViewModel().get('entity');
        if (!view.isValid()) {
            return;
        }
        product.view.goods.inbound.GoodsInboundService.save(entity);
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
                Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'search', {localSearch: true});

            }
        });
    }
});