/**
 * Created by Administrator on 2020/3/23.
 */
Ext.define('invest.view.settledetail.search.SettleDetailSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.settledetail.search',

    requires: [
        'Cxt.util.Toast'
    ],

    /**
     * 批处理
     * @param action
     * @param actionText
     * @param records
     */
    doBatchAction: function (action, actionText, records) {
        var me = this;
        if (action == 'settle') {
            var entities = [];
            Ext.Array.each(records, function (record) {
                Ext.Array.push(entities, record.getData());
            });
            if (Ext.isEmpty(entities)) {
                Cxt.util.Toast.warning('请先选择要出账的明细');
                return;
            }
            invest.view.settledetail.SettleDetailService['settle'](entities).then(function (responseText) {
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