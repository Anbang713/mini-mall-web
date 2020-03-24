/**
 * Created by Administrator on 2020/3/18.
 */
Ext.define('invest.view.store.Store', {
    alias: 'invest.store',

    singleton: true,
    alternateClassName: 'Store',

    moduleId: 'invest.store',
    moduleCaption: '项目',

    servicePath: 'api/invest/store/',
    cacheKeyPrefix: "mall:invest:store:"
});