/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('sales.view.paymenttype.view.PaymentTypeViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.sales.paymenttype.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        sales.view.paymenttype.PaymentTypeService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        sales.view.paymenttype.PaymentTypeService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});