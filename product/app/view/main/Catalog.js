/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('product.view.main.Catalog', {
    extend: 'Ext.panel.Panel',
    xtype: 'catalog',

    requires: [
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.layout.container.Column',
        'Ext.panel.Panel',
        'product.view.goods.Goods',
        'product.view.goods.inbound.GoodsInbound'
    ],

    layout: 'column',
    bodyPadding: 10,

    items: [{
        xtype: 'panel',
        title: '商品管理',
        width: '100%',
        columnWidth: 0.5,
        bodyPadding: 10,
        layout: 'column',
        defaults: {
            margin: 5
        },
        items: [{
            xtype: 'button',
            text: '商品管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '商品入库单管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'search');
            }
        }]
    }]
});