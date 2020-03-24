/**
 * Created by Administrator on 2020/3/20.
 */
Ext.define('invest.view.building.Building', {
    alias: 'invest.building',

    singleton: true,
    alternateClassName: 'Building',

    moduleId: 'invest.building',
    moduleCaption: '楼宇',

    servicePath: 'api/invest/building/',
    cacheKeyPrefix: "mall:invest:building:"
});