/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('product.view.goods.search.GoodsSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.product.goods.search',

    requires: [
        'Cxt.util.Window',
        'Cxt.window.BatchProcessor',
        'product.view.goods.Goods',
        'product.view.goods.GoodsService'
    ],

    doCreate: function () {
        Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'create');
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
                        product.view.goods.GoodsService.doEnable(record.getData(), false).then(function (response) {
                            callback.onSuccess(response);
                        }).otherwise(function (response) {
                            callback.onFailure(response);
                        });
                    } else if (action == 'disable') {
                        product.view.goods.GoodsService.doDisable(record.getData(), false).then(function (response) {
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
            Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'edit', {
                uuid: record.get('uuid')
            });
        } else {
            product.view.goods.GoodsService[action](entity).then(function () {
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
            Cxt.util.Window.moduleRedirectTo(product.view.goods.Goods.moduleId, 'view', {
                uuid: record.get('uuid')
            });
        }
    }
});