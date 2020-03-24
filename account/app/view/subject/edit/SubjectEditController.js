/**
 * Created by gengpan on 2017/2/15.
 */
Ext.define('account.view.subject.edit.SubjectEditController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.account.subject.edit',

    requires: [
        'Cxt.util.Window'
    ],

    doSave: function () {
        var me = this,
            view = me.getView(),
            entity = view.getViewModel().get('entity');
        if (!view.isValid()) {
            return;
        }
        account.view.subject.SubjectService.save(entity);
    },

    doCancel: function () {
        var me = this,
            entity = me.getView().getViewModel().get('entity');
        var cancelMsg = "确定要取消新建吗？";

        if (!Ext.isEmpty(entity.uuid)) {
            cancelMsg = "确定要取消编辑吗？";
        }
        Ext.Msg.confirm("提示", cancelMsg, function (success) {
            if (success == 'yes' && Cxt.util.Window.back() === false) {
                Cxt.util.Window.moduleRedirectTo(account.view.subject.Subject.moduleId, 'search', {localSearch: true});

            }
        });
    }
});