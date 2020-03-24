/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.contract.Contract', {
    alias: 'invest.contract',

    singleton: true,
    alternateClassName: 'Contract',

    moduleId: 'invest.contract',
    moduleCaption: '合同',

    servicePath: 'api/invest/contract/',
    cacheKeyPrefix: "mall:invest:contract:"
});