/**
 * Created by Administrator on 2020/3/20.
 */
Ext.define('invest.view.building.view.BuildingViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.building.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.building.Building.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.building.Building.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.building.BuildingService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.building.Building.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.building.BuildingService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.building.Building.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});