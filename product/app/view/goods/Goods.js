/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('product.view.goods.Goods', {
    alias: 'product.goods',

    singleton: true,
    alternateClassName: 'Goods',

    moduleId: 'product.goods',
    moduleCaption: '商品',

    servicePath: 'api/product/goods/',
    cacheKeyPrefix: "mall:product:goods:"
});