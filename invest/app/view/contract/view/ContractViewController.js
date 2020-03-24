/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.contract.view.ContractViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.contract.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.contract.Contract.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.contract.Contract.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doDelete: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.contract.ContractService['delete'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.contract.Contract.moduleId, 'search', {
                localSearch: true
            });
        });
    },

    doEffect: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.contract.ContractService['effect'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.contract.Contract.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});