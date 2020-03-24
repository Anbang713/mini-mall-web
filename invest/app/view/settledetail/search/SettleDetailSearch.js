/**
 * Created by Administrator on 2020/3/23.
 */
Ext.define('invest.view.settledetail.search.SettleDetailSearch', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'invest.settledetail.search',

    viewModel: {},
    controller: 'invest.settledetail.search',

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                columnWidth: 1,
                xtype: 'grid.stateful',
                itemId: 'searchGrid',
                width: '100%',
                queryUrl: invest.view.settledetail.SettleDetail.servicePath + '/query',
                filterGroupId: invest.view.settledetail.SettleDetail.moduleId,
                fetchParts: ['store', 'tenant', 'contract'],
                tagSelectors: me.createTagSelectors(),
                conditions: me.createConditions(),
                operations: me.createOperations(),
                columns: me.createColumns(),
                applyBatchAction: Ext.bind(me.applyBatchAction, me),
                applyContextMenu: Ext.bind(me.applyContextMenu, me),
                defaultSort: {
                    property: 'store',
                    direction: 'ASC'
                },
                listeners: {
                    batchaction: 'doBatchAction',
                    itemaction: 'doItemAction'
                }
            }]
        });
        me.callParent(arguments);
    },

    createTagSelectors: function () {
        return {
            selector: 'noStatement',
            caption: '是否出账',
            mode: 'DEFAULT',
            tags: [{
                tag: 'true',
                tagCaption: '是',
                main: true
            }, {
                tag: 'false',
                tagCaption: '否',
                main: true
            }]
        };
    },

    createConditions: function () {
        return [{
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
            xtype: 'cpnt.account.subject.combo',
            fieldName: 'subjectUuid',
            fieldLabel: '科目',
            hidden: false
        }]
    },

    createOperations: function () {
        return [{
            xtype: 'authorbutton',
            text: '出账',
            ui: 'primary',
            batchable: true,
            action: 'settle',
            actionText: '出账',
            authorization: true
        }];
    },

    createColumns: function () {
        return [{
            dataIndex: 'statement',
            text: '是否出账',
            width: 100,
            locked: true,
            hideable: false,
            sortable: false,
            renderer: function (value, metaDate, record) {
                return record.get('statementUuid') == '-' ? '否' : '是';
            }
        }, {
            dataIndex: 'store',
            text: '项目',
            minWidth: 160,
            flex: 1,
            sortParam: 'store.code',
            renderer: Ext.util.Format.ucnRenderer()
        }, {
            dataIndex: 'tenant',
            text: '商户',
            width: 160,
            sortParam: 'tenant.code',
            renderer: Ext.util.Format.ucnRenderer()
        }, {
            dataIndex: 'contract',
            text: '合同',
            width: 160,
            sortParam: 'contract.code',
            renderer: function (value) {
                return value ? value['signboard'] + '[' + value['serialNumber'] + ']' : '';
            }
        }, {
            dataIndex: 'beginDate',
            text: '结算起始日期',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('Y-m-d')
        }, {
            dataIndex: 'endDate',
            text: '结算截止日期',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('Y-m-d')
        }, {
            dataIndex: 'total',
            text: '本次出账金额',
            width: 120,
            align: 'right',
            renderer: Ext.util.Format.numberRenderer(',#.00')
        }, {
            dataIndex: 'tax',
            text: '本次出账税额',
            width: 120,
            align: 'right',
            renderer: Ext.util.Format.numberRenderer(',#.00')
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
            if (item.action === 'settle' && record.get('statementUuid') == '-') {
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
        if (item.action === 'settle' && record.get('statementUuid') != '-') {
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