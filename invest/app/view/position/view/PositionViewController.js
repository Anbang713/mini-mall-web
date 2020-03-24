/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.position.view.PositionViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.position.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.position.Position.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.position.Position.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.position.PositionService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.position.Position.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.position.PositionService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.position.Position.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});