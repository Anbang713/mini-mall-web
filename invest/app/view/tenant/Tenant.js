/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.tenant.Tenant', {
    alias: 'invest.tenant',

    singleton: true,
    alternateClassName: 'Tenant',

    moduleId: 'invest.tenant',
    moduleCaption: '商户',

    servicePath: 'api/invest/tenant/',
    cacheKeyPrefix: "mall:invest:tenant:"
});