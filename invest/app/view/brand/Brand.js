/**
 * 品牌模块定义。
 */
Ext.define('invest.view.brand.Brand', {
    alias: 'invest.brand',

    singleton: true,
    alternateClassName: 'Brand',

    moduleId: 'invest.brand',
    moduleCaption: '品牌',

    servicePath: 'api/invest/brand/',
    cacheKeyPrefix: "mall:invest:brand:"
});