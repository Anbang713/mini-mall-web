/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.floor.view.FloorViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.floor.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.floor.Floor.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.floor.Floor.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.floor.FloorService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.floor.Floor.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.floor.FloorService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.floor.Floor.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});