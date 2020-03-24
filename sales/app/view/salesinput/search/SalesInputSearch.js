/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('sales.view.salesinput.search.SalesInputSearch', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'sales.salesinput.search',

    viewModel: {},
    controller: 'sales.salesinput.search',

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
                queryUrl: sales.view.salesinput.SalesInput.servicePath + '/query',
                filterGroupId: sales.view.salesinput.SalesInput.moduleId,
                fetchParts: ['store', 'tenant', 'contract'],
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
            xtype: 'cpnt.investment.store.combo',
            fieldName: 'storeUuid',
            fieldLabel: '项目',
            hidden: false
        }, {
            xtype: 'cpnt.investment.tenant.combo',
            fieldName: 'tenantUuid',
            fieldLabel: '商户',
            hidden: false
        }, {
            xtype: 'cpnt.investment.contract.combo',
            fieldName: 'contractUuid',
            fieldLabel: '合同',
            hidden: false
        }, {
            xtype: 'cpnt.product.goods.combo',
            fieldName: 'goodsUuid',
            fieldLabel: '商品',
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
            dataIndex: 'store',
            text: '项目',
            width: 120,
            renderer: Ext.util.Format.ucnRenderer()
        }, {
            dataIndex: 'tenant',
            text: '商户',
            width: 120,
            renderer: Ext.util.Format.ucnRenderer()
        }, {
            dataIndex: 'contract',
            text: '合同',
            width: 120,
            renderer: function (value) {
                if (!value)
                    return value;
                return value['signboard'] + '[' + value['serialNumber'] + ']';
            }
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