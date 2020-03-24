/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('sales.view.salesinput.view.SalesInputViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.sales.salesinput.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doDelete: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        sales.view.salesinput.SalesInputService['delete'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'search', {
                localSearch: true
            });
        });
    },

    doEffect: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        sales.view.salesinput.SalesInputService['effect'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});