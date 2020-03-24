/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('product.view.goods.edit.GoodsEditController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.product.goods.edit',

    requires: [
        'Cxt.util.Window',
        'product.view.goods.Goods',
        'product.view.goods.GoodsService'
    ],

    doSave: function () {
        var me = this,
            view = me.getView(),
            entity = view.getViewModel().get('entity');
        if (!view.isValid()) {
            return;
        }
        product.view.goods.GoodsService.save(entity);
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
                Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'search', {localSearch: true});

            }
        });
    }
});