/**
 * 销售数据模块定义。
 */
Ext.define('sales.view.salesinput.SalesInput', {
    alias: 'sales.salesinput',

    singleton: true,
    alternateClassName: 'SalesInput',

    moduleId: 'sales.salesinput',
    moduleCaption: '销售数据录入单',

    servicePath: 'api/sales/salesinput/',
    moduleKeyPrefix: "mall:sales:input:"
});