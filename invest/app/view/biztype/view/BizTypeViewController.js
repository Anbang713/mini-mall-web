/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.biztype.view.BizTypeViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.biztype.view',

    requires: [
        'Cxt.util.Window'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.biztype.BizType.moduleId, 'create');
    },

    doEdit: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        Cxt.util.Window.moduleRedirectTo(invest.view.biztype.BizType.moduleId, 'edit', {
            uuid: entity.uuid
        });
    },

    doEnable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.biztype.BizTypeService['enable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.biztype.BizType.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    },

    doDisable: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        invest.view.biztype.BizTypeService['disable'](entity).then(function () {
            Cxt.util.Window.moduleRedirectTo(invest.view.biztype.BizType.moduleId, 'view', {
                uuid: entity.uuid
            });
        });
    }
});