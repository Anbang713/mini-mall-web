/**
 * Created by gengpan on 2017/2/24.
 */
Ext.define('sales.view.paymenttype.PaymentTypeService', {
    alias: 'sales.paymenttype.service',
    alternateClassName: 'PaymentTypeService',
    requires: [
        'Cxt.util.Toast',
        'Cxt.util.Window',
        'Ext.util.Format'
    ],

    singleton: true,

    save: function (entity) {
        var deferred = Ext.create('Ext.Deferred');

        Ext.Ajax.request({
            url: sales.view.paymenttype.PaymentType.servicePath,
            failureToast: true,
            waitMsg: '正在保存...',
            jsonData: entity
        }).then(function (response) {
            Cxt.util.Toast.success('保存成功');
            Cxt.util.Window.moduleRedirectTo(sales.view.paymenttype.PaymentType.moduleId, 'view', {
                uuid: response.responseText
            });
            deferred.resolve(response.responseText);
        });
        return deferred.promise;
    },

    disable: function (entity) {
        var me = this;
        var deferred = Ext.create('Ext.Deferred');

        Ext.Msg.confirm("提示", "确定要停用" + Ext.util.Format.ucn(entity) + "吗?", function (optional) {
            if (optional == 'yes') {
                me.doDisable(entity, true).then(function () {
                    Cxt.util.Toast.success('付款方式(' + Ext.util.Format.ucn(entity) + ')' + '停用成功');
                    deferred.resolve();
                }).otherwise(function (response) {
                    deferred.reject(response);
                });
            }
        });
        return deferred.promise;
    },

    doDisable: function (entity, isView) {
        var deferred = Ext.create('Ext.Deferred');
        var ajax = {
            url: sales.view.paymenttype.PaymentType.servicePath + entity['uuid'],
            method: 'PUT',
            params: {
                targetState: 'disabled'
            }
        };
        if (isView) {
            ajax.failureToast = true;
            ajax.waitMsg = '正在停用...';
        }
        Ext.Ajax.request(ajax).then(function () {
            deferred.resolve();
        }).otherwise(function (response) {
            deferred.reject(response);
        });
        return deferred.promise;
    },

    enable: function (entity) {
        var me = this;
        var deferred = Ext.create('Ext.Deferred');

        Ext.Msg.confirm("提示", "确定要启用" + Ext.util.Format.ucn(entity) + "吗?", function (optional) {
            if (optional == 'yes') {
                me.doEnable(entity, true).then(function () {
                    Cxt.util.Toast.success('付款方式(' + Ext.util.Format.ucn(entity) + ')' + '启用成功');
                    deferred.resolve();
                }).otherwise(function (response) {
                    deferred.reject(response);
                });
            }
        });
        return deferred.promise;
    },

    doEnable: function (entity, isView) {
        var deferred = Ext.create('Ext.Deferred');
        var ajax = {
            url: sales.view.paymenttype.PaymentType.servicePath + entity['uuid'],
            method: 'PUT',
            params: {
                targetState: 'using'
            }
        };
        if (isView) {
            ajax.failureToast = true;
            ajax.waitMsg = '正在启用...';
        }
        Ext.Ajax.request(ajax).then(function () {
            deferred.resolve();
        }).otherwise(function (response) {
            deferred.reject(response);
        });
        return deferred.promise;
    },

    load: function (urlParams) {
        var deferred = Ext.create('Ext.Deferred');
        if (!urlParams || !urlParams.uuid) {
            Ext.Msg.alert("提示", "缺少必要的url参数", function () {
                window.top.history.go(-1);// 后退
            });
            deferred.reject();
        } else {
            Ext.Ajax.request({
                url: sales.view.paymenttype.PaymentType.servicePath + urlParams.uuid,
                failureToast: true,
                method: 'GET',
                waitMsg: '正在加载...'
            }).then(function (response) {
                var result = Ext.JSON.decode(response.responseText, true);
                deferred.resolve(result);
            });
            return deferred.promise;
        }
    }
});