/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('product.view.goods.view.GoodsViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.product.goods.view',

    requires: [
        'Cxt.util.Window',
        'product.view.goods.Goods',
        'product.view.goods.GoodsService'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        product.view.goods.GoodsService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        product.view.goods.GoodsService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});