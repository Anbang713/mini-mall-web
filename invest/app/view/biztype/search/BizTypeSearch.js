/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.biztype.search.BizTypeSearch', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'invest.biztype.search',

    viewModel: {},
    controller: 'invest.biztype.search',

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
                queryUrl: invest.view.biztype.BizType.servicePath + '/query',
                filterGroupId: invest.view.biztype.BizType.moduleId,
                tagSelectors: me.createTagSelectors(),
                conditions: me.createConditions(),
                operations: me.createOperations(),
                columns: me.createColumns(),
                applyBatchAction: Ext.bind(me.applyBatchAction, me),
                applyContextMenu: Ext.bind(me.applyContextMenu, me),
                defaultSort: {
                    property: 'code',
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
                tag: 'using',
                tagCaption: '使用中',
                main: true
            }, {
                tag: 'disabled',
                tagCaption: '已停用',
                main: true
            }]
        };
    },

    createConditions: function () {
        return [{
            xtype: 'textfield',
            fieldName: 'keyword',
            fieldLabel: '关键字',
            emptyText: '代码/名称',
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
            text: '启用',
            ui: 'primary',
            batchable: true,
            action: 'enable',
            actionText: '启用',
            authorization: true
        }, {
            xtype: 'authorbutton',
            text: '停用',
            ui: 'danger',
            batchable: true,
            action: 'disable',
            actionText: '停用',
            authorization: true
        }];
    },

    createColumns: function () {
        return [{
            dataIndex: 'code',
            text: '代码',
            width: 120,
            locked: true,
            hideable: false,
            groupable: false,
            renderer: Ext.util.Format.linkRenderer()
        }, {
            dataIndex: 'name',
            text: '名称',
            width: 120
        }, {
            dataIndex: 'state',
            text: '状态',
            width: 100,
            renderer: Ext.util.Format.usingStateRenderer()
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
            if (item.action === 'enable' && record.get('state') == 'disabled') {
                return true;
            } else if (item.action === 'disable' && record.get('state') == 'using') {
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
        var isUsing = record.get('state') == 'using';
        if (item.action === 'edit' && isUsing == false) {
            return false;
        } else if (item.action === 'enable' && isUsing) {
            return false;
        } else if (item.action === 'disable' && isUsing == false) {
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