/**
 * 付款方式
 */
Ext.define('sales.view.paymenttype.PaymentType', {
    alias: 'sales.paymenttype',

    singleton: true,
    alternateClassName: 'PaymentType',

    moduleId: 'sales.paymenttype',
    moduleCaption: '付款方式',

    servicePath: 'api/sales/paymenttype/',
    cacheKeyPrefix: "mall:sales:paymenttype:"
});