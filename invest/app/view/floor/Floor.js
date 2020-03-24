/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.floor.Floor', {
    alias: 'invest.floor',

    singleton: true,
    alternateClassName: 'Floor',

    moduleId: 'invest.floor',
    moduleCaption: '楼层',

    servicePath: 'api/invest/floor/',
    cacheKeyPrefix: "mall:invest:floor:"
});