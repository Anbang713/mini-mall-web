/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.tenant.view.TenantViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.tenant.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.tenant.Tenant.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.tenant.Tenant.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.tenant.TenantService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.tenant.Tenant.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.tenant.TenantService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.tenant.Tenant.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});