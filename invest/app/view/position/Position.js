/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.position.Position', {
    alias: 'invest.position',

    singleton: true,
    alternateClassName: 'Position',

    moduleId: 'invest.position',
    moduleCaption: '铺位',

    servicePath: 'api/invest/position/',
    cacheKeyPrefix: "mall:invest:position:"
});