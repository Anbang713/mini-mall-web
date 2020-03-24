/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('sales.view.salesinput.search.SalesInputSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.sales.salesinput.search',

    requires: [
        'Cxt.util.Window',
        'Cxt.window.BatchProcessor'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'create');
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
                labelTpl: '{data.billNumber}',
                executeFn: function (record, callback) {
                    if (action == 'effect') {
                        sales.view.salesinput.SalesInputService.doEffect(record.getData(), false).then(function (response) {
                            callback.onSuccess(response);
                        }).otherwise(function (response) {
                            callback.onFailure(response);
                        });
                    } else if (action == 'delete') {
                        sales.view.salesinput.SalesInputService.doDelete(record.getData(), false).then(function (response) {
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
            Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'edit', {
                uuid: record.get('uuid')
            });
        } else {
            sales.view.salesinput.SalesInputService[action](entity).then(function () {
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
        if (cellContext.column && cellContext.column.dataIndex == 'billNumber') {
            Cxt.util.Window.moduleRedirectTo(sales.view.salesinput.SalesInput.moduleId, 'view', {
                uuid: record.get('uuid')
            });
        }
    }
});