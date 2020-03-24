/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.search.GoodsInboundSearch', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'product.goods.inbound.search',

    viewModel: {},
    controller: 'product.goods.inbound.search',

    createTitlebar: function () {
        return {
            rightItems: [{
                xtype: 'button',
                text: '新建',
                ui: 'primary',
                iconCls: 'fa fa-plus',
                handler: 'doCreate'
            }]
        };
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                columnWidth: 1,
                xtype: 'grid.stateful',
                itemId: 'searchGrid',
                width: '100%',
                queryUrl: product.view.goods.inbound.GoodsInbound.servicePath + '/query',
                filterGroupId: product.view.goods.inbound.GoodsInbound.moduleId,
                tagSelectors: me.createTagSelectors(),
                conditions: me.createConditions(),
                operations: me.createOperations(),
                columns: me.createColumns(),
                applyBatchAction: Ext.bind(me.applyBatchAction, me),
                applyContextMenu: Ext.bind(me.applyContextMenu, me),
                defaultSort: {
                    property: 'billNumber',
                    direction: 'ASC'
                },
                listeners: {
                    batchaction: 'doBatchAction',
                    itemaction: 'doItemAction',
                    rowclick: 'onGridRowClick'
                }
            }]
        });
        me.callParent(arguments);
    },

    createTagSelectors: function () {
        return {
            selector: 'state',
            caption: '状态',
            mode: 'DEFAULT',
            tags: [{
                tag: 'ineffect',
                tagCaption: '未生效',
                main: true
            }, {
                tag: 'effect',
                tagCaption: '已生效',
                main: true
            }]
        };
    },

    createConditions: function () {
        return [{
            xtype: 'textfield',
            fieldName: 'keyword',
            fieldLabel: '单号',
            hidden: false
        }, {
            xtype: 'daterangefield',
            fieldName: 'dateRange',
            fieldLabel: '入库日期',
            hidden: false
        }, {
            xtype: 'cpnt.product.goods.combo',
            fieldName: 'goodsUuid',
            fieldLabel: '商品',
            hidden: false
        }, {
            xtype: 'cpnt.product.warehouse.combo',
            fieldName: 'warehouse',
            fieldLabel: '仓库',
            hidden: false
        }]
    },

    createOperations: function () {
        return [{
            xtype: 'authorbutton',
            text: '编辑',
            ui: 'primary',
            batchable: false,
            action: 'edit',
            actionText: '编辑',
            authorization: true
        }, {
            xtype: 'authorbutton',
            text: '删除',
            ui: 'danger',
            batchable: true,
            action: 'delete',
            actionText: '删除',
            authorization: true
        }, {
            xtype: 'authorbutton',
            text: '生效',
            ui: 'primary',
            batchable: true,
            action: 'effect',
            actionText: '生效',
            authorization: true
        }];
    },

    createColumns: function () {
        return [{
            dataIndex: 'billNumber',
            text: '单号',
            width: 160,
            locked: true,
            hideable: false,
            groupable: false,
            renderer: Ext.util.Format.linkRenderer()
        }, {
            dataIndex: 'state',
            text: '状态',
            width: 100,
            renderer: Ext.util.Format.bizStateRenderer()
        }, {
            dataIndex: 'inboundDate',
            text: '入库日期',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('Y-m-d')
        }, {
            dataIndex: 'warehouse',
            text: '仓库',
            width: 120
        }, {
            dataIndex: 'remark',
            text: '说明',
            groupable: false,
            minWidth: 160,
            flex: 1
        }]
    },

    /**
     *批量按钮的显隐
     * @param item
     * @param records
     * @returns {*|boolean}
     */
    applyBatchAction: function (item, records) {
        return Ext.Array.every(records, function (record) {
            if (item.action === 'effect' && record.get('state') == 'ineffect') {
                return true;
            } else if (item.action === 'delete' && record.get('state') == 'ineffect') {
                return true;
            }
        });
    },

    /**
     *鼠标右键菜单
     * @param item
     * @param record
     * @returns {boolean} false不显示
     */
    applyContextMenu: function (item, record) {
        var isEffect = record.get('state') == 'effect';
        if (item.action === 'edit' && isEffect) {
            return false;
        } else if (item.action === 'effect' && isEffect) {
            return false;
        } else if (item.action === 'delete' && isEffect) {
            return false;
        }
    },

    onRefresh: function () {
        var me = this;
        me.callParent(arguments);
        if (me.urlParams['localSearch']) {
            me.down('#searchGrid').loadLocalSearch();
        } else {
            me.down('#searchGrid').doSearch();
        }
    }
});