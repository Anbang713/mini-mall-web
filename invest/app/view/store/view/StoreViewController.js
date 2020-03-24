/**
 * Created by Administrator on 2020/3/19.
 */
Ext.define('invest.view.store.view.StoreViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.store.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.store.StoreService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.store.StoreService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});