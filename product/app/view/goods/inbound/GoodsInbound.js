/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.GoodsInbound', {
    alias: 'product.goods.inbound',

    singleton: true,
    alternateClassName: 'GoodsInbound',

    moduleId: 'product.goods.inbound',
    moduleCaption: '商品入库单',

    servicePath: 'api/product/goodsinbound/',
    cacheKeyPrefix: "mall:product:goodsinbound:"
});