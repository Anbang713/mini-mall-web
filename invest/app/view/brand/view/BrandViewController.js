/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.brand.view.BrandViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.brand.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.brand.Brand.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.brand.Brand.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.brand.BrandService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.brand.Brand.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.brand.BrandService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.brand.Brand.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});