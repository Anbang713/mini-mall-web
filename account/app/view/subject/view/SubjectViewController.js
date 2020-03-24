/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('account.view.subject.view.SubjectViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.account.subject.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(account.view.subject.Subject.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(account.view.subject.Subject.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        account.view.subject.SubjectService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(account.view.subject.Subject.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        account.view.subject.SubjectService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(account.view.subject.Subject.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});