/**
 * Created by Administrator on 2020/3/24.
 */
Ext.define('invest.view.settledetail.SettleDetailService', {
    alias: 'invest.settledetail.service',
    alternateClassName: 'SettleDetailService',
    requires: [],

    singleton: true,

    settle: function (records) {
        var deferred = Ext.create('Ext.Deferred');

        Ext.Msg.confirm("提示", "确定对此结算明细出账吗?", function (optional) {
            if (optional == 'yes') {
                Ext.Ajax.request({
                    url: 'api/account/statement/settle',
                    method: 'POST',
                    failureToast: true,
                    waitMsg: '正在出账...',
                    jsonData: records
                }).then(function (response) {
                    deferred.resolve(response.responseText);
                }).otherwise(function (response) {
                    deferred.reject(response);
                });
            }
        });
        return deferred.promise;
    }
});