/**
 * Created by Administrator on 2020/3/18.
 */
Ext.define('invest.view.store.search.StoreSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.invest.store.search',

    requires: [
        'Cxt.util.Window',
        'Cxt.window.BatchProcessor'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'create');
    },

    /**
     * 批处理
     * @param action
     * @param actionText
     * @param records
     */
    doBatchAction: function (action, actionText, records) {
        var me = this,
            batchprocessor = Ext.create({
                xtype: 'batchprocessor',
                actionText: actionText,
                records: records,
                belongTo: me.getView(),
                labelTpl: '{data.name}[{data.code}]',
                executeFn: function (record, callback) {
                    if (action == 'enable') {
                        invest.view.store.StoreService.doEnable(record.getData(), false).then(function (response) {
                            callback.onSuccess(response);
                        }).otherwise(function (response) {
                            callback.onFailure(response);
                        });
                    } else if (action == 'disable') {
                        invest.view.store.StoreService.doDisable(record.getData(), false).then(function (response) {
                            callback.onSuccess(response);
                        }).otherwise(function (response) {
                            callback.onFailure(response);
                        });
                    }
                },
                listeners: {
                    complete: function () {
                        me.getView().down("#searchGrid").doSearch();
                    }
                }
            });
        batchprocessor.batchProcess();
    },

    /**
     * 鼠标右键处理
     * @param action
     * @param actionText
     * @param record
     */
    doItemAction: function (action, actionText, record) {
        var me = this,
            entity = record.getData();
        if (action === 'edit') {
            Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'edit', {
                uuid: record.get('uuid')
            });
        } else {
            invest.view.store.StoreService[action](entity).then(function () {
                me.getView().down('#searchGrid').doSearch();
            });
        }
    },

    /**
     * 列的点击处理
     * @param grid
     * @param record
     * @param tr
     * @param rowIndex
     * @param event
     */
    onGridRowClick: function (grid, record, tr, rowIndex, event) {
        var cellContext = event.position;
        if (cellContext.column && cellContext.column.dataIndex == 'code') {
            Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'view', {
                uuid: record.get('uuid')
            });
        }
    }
});