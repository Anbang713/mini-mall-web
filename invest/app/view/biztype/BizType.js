/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.biztype.BizType', {
    alias: 'invest.biztype',

    singleton: true,
    alternateClassName: 'BizType',

    moduleId: 'invest.biztype',
    moduleCaption: '业态',

    servicePath: 'api/invest/biztype/',
    cacheKeyPrefix: "mall:invest:biztype:"
});