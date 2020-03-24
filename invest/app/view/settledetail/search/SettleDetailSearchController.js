/**
 * Created by Administrator on 2020/3/23.
 */
Ext.define('invest.view.settledetail.search.SettleDetailSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.settledetail.search',

    requires: [],

    /**
     * 批处理
     * @param action
     * @param actionText
     * @param records
     */
    doBatchAction: function (action, actionText, records) {
        var me = this;
        if (action == 'settle') {
            account.view.settledetail.SettleDetailService['settle'](records).then(function (responseText) {
                console.log(responseText);
                me.getView().down("#searchGrid").doSearch();
            });
        }
    },

    /**
     * 鼠标右键处理
     * @param action
     * @param actionText
     * @param record
     */
    doItemAction: function (action, actionText, record) {
        var entity = record.getData();
        if (action === 'settle') {
            invest.view.settledetail.SettleDetailService['settle']([entity]).then(function (responseText) {
                console.log(responseText);
                me.getView().down("#searchGrid").doSearch();
            });
        }
    }
});