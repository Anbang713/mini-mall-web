/**
 * Created by Administrator on 2020/3/25.
 */
Ext.define('account.view.statement.view.StatementViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.account.statement.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(account.view.statement.Statement.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(account.view.statement.Statement.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doDelete: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        account.view.statement.StatementService['delete'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(account.view.statement.Statement.moduleId, 'search', {
                localSearch: true
            });
        });
    },

    doEffect: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        account.view.statement.StatementService['effect'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(account.view.statement.Statement.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});