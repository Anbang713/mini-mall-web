/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.view.GoodsInboundViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.product.goods.inbound.view',

    requires: [
        'Cxt.util.Window',
        'product.view.goods.inbound.GoodsInbound',
        'product.view.goods.inbound.GoodsInboundService'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doDelete: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        product.view.goods.inbound.GoodsInboundService['delete'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'search', {
                localSearch: true
            });
        });
    },

    doEffect: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        product.view.goods.inbound.GoodsInboundService['effect'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});