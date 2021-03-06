/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.contract.ContractService', {
    alias: 'invest.contract.service',
    alternateClassName: 'ContractService',
    requires: [
        'Cxt.util.Toast',
        'Cxt.util.Window'
    ],

    singleton: true,

    save: function (entity) {
        var deferred = Ext.create('Ext.Deferred');

        Ext.Ajax.request({
            url: invest.view.contract.Contract.servicePath,
            failureToast: true,
            waitMsg: '正在保存...',
            jsonData: entity
        }).then(function (response) {
            Cxt.util.Toast.success('保存成功');
            Cxt.util.Window.moduleRedirectTo(invest.view.contract.Contract.moduleId, 'view', {
                uuid: response.responseText
            });
            deferred.resolve(response.responseText);
        });
        return deferred.promise;
    },

    delete: function (entity) {
        var me = this;
        var deferred = Ext.create('Ext.Deferred');

        Ext.Msg.confirm("提示", "确定要删除该合同吗?", function (optional) {
            if (optional == 'yes') {
                me.doDelete(entity, true).then(function () {
                    Cxt.util.Toast.success('合同(' + entity['serialNumber'] + ')' + '删除成功');
                    deferred.resolve();
                }).otherwise(function (response) {
                    deferred.reject(response);
                });
            }
        });
        return deferred.promise;
    },

    doDelete: function (entity, isView) {
        var deferred = Ext.create('Ext.Deferred');
        var ajax = {
            url: invest.view.contract.Contract.servicePath + entity['uuid'],
            method: 'DELETE'
        };
        if (isView) {
            ajax.failureToast = true;
            ajax.waitMsg = '正在删除...';
        }
        Ext.Ajax.request(ajax).then(function () {
            deferred.resolve();
        }).otherwise(function (response) {
            deferred.reject(response);
        });
        return deferred.promise;
    },

    effect: function (entity) {
        var me = this;
        var deferred = Ext.create('Ext.Deferred');

        Ext.Msg.confirm("提示", "确定要生效该合同吗?", function (optional) {
            if (optional == 'yes') {
                me.doEffect(entity, true).then(function () {
                    Cxt.util.Toast.success('合同(' + entity['serialNumber'] + ')' + '生效成功');
                    deferred.resolve();
                }).otherwise(function (response) {
                    deferred.reject(response);
                });
            }
        });
        return deferred.promise;
    },

    doEffect: function (entity, isView) {
        var deferred = Ext.create('Ext.Deferred');
        var ajax = {
            url: invest.view.contract.Contract.servicePath + entity['uuid'],
            method: 'PUT'
        };
        if (isView) {
            ajax.failureToast = true;
            ajax.waitMsg = '正在生效...';
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
                url: invest.view.contract.Contract.servicePath + urlParams.uuid,
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