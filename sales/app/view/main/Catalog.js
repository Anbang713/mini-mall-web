/**
 * Created by cRazy on 2016/10/11.
 */
Ext.define('sales.view.main.Catalog', {
    extend: 'Ext.panel.Panel',
    xtype: 'catalog',

    requires: [
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.layout.container.Column',
        'Ext.panel.Panel'
    ],

    layout: 'column',
    bodyPadding: 10,

    items: [{
        xtype: 'panel',
        title: '销售管理',
        width: '100%',
        columnWidth: 0.5,
        bodyPadding: 10,
        layout: 'column',
        defaults: {
            margin: 5
        },
        items: [{
            xtype: 'button',
            text: '付款方式管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '销售数据录入单',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'search');
            }
        }]
    }]
});