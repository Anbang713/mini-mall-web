/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.search.GoodsInboundSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.product.goods.inbound.search',

    requires: [
        'Cxt.util.Window',
        'Cxt.window.BatchProcessor',
        'product.view.goods.inbound.GoodsInbound',
        'product.view.goods.inbound.GoodsInboundService'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'create');
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
                        product.view.goods.inbound.GoodsInboundService.doEffect(record.getData(), false).then(function (response) {
                            callback.onSuccess(response);
                        }).otherwise(function (response) {
                            callback.onFailure(response);
                        });
                    } else if (action == 'delete') {
                        product.view.goods.inbound.GoodsInboundService.doDelete(record.getData(), false).then(function (response) {
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
            Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'edit', {
                uuid: record.get('uuid')
            });
        } else {
            product.view.goods.inbound.GoodsInboundService[action](entity).then(function () {
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
            Cxt.util.Window.moduleRedirectTo(product.view.goods.inbound.GoodsInbound.moduleId, 'view', {
                uuid: record.get('uuid')
            });
        }
    }
});