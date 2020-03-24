/**
 * 批量添加Window的基类。
 * 通常情况下，子类需要提供title、queryUrl、conditions、columns等配置项
 * Created by chenganbang on 2017/7/26.
 */
Ext.define('Cpnt.window.MultiSelectWindow', {
    extend: 'Ext.window.Window',
    xtype: 'cpnt.base.select.window',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Toast',
        'Ext.button.Button',
        'Ext.data.Store',
        'Ext.data.proxy.Ajax',
        'Ext.form.FieldContainer',
        'Ext.form.Label',
        'Ext.form.Panel',
        'Ext.form.field.Display',
        'Ext.grid.Panel',
        'Ext.toolbar.Fill',
        'Ext.toolbar.Paging',
        'Ext.util.Format'
    ],

    closeAction: 'hide',
    constrainPosition: 'center',
    width: 800,
    gridMaxHeight: 400,
    modal: true,
    viewModel: {},

    labelWidth: 75,

    /**
     * 是否查询摘要
     */
    querySummary: false,

    /**
     * takeCount的tpl
     */
    takeCountTpl: '{name}',

    /**
     * 默认分页数量
     */
    pageSize: 10,

    /**
     * 数据请求地址，如：'sales/gift/query.hd'
     */
    queryUrl: undefined,

    /**
     * 查询条件，提供以下字段，使用者可以根据需要进行选择。为空时，不提供搜索和清空按钮。
     */
    conditions: [],

    /**
     * 列，使用者可以根据实际情况自行编码。
     */
    columns: [],

    /**
     * 默认排序列，如：
     * sorters: [{
        property: 'code',
        direction: 'ASC'
        }],
     */
    sorters: [],

    /**
     * @cfg {Boolean} keepSelect
     * 提供保持搜索选择的功能
     */
    keepSelect: true,

    /**
     * 列选择模式，默认为可多选的复选框，mode取值'MULTI'和'SINGLE'
     */
    selModel: {
        selType: 'checkboxmodel',
        mode: 'MULTI',
        fireEach: true
    },

    config: {
        /**
         * 排除已选，通常为uuid的数组表示
         */
        expects: [],

        /**
         * 确定时是否允许不选择任何记录
         */
        allowBlank: false
    },

    initComponent: function () {
        var me = this,
            store = me.createStore(),
            dockedItems = Ext.Array.from(me.dockedItems);

        dockedItems.push(me.buildFilters());
        dockedItems.push(me.buildCounter());
        if (me.pageSize > 0) {
            dockedItems.push({
                xtype: 'pagingtoolbar',
                store: store,
                dock: 'bottom',
                sequence: 1,
                displayInfo: true
            });
        }


        dockedItems.push({
            xtype: 'toolbar',
            width: '100%',
            dock: 'bottom',
            sequence: 2,
            items: ['->', {
                xtype: 'button',
                text: '确定',
                ui: 'primary',
                width: 80,
                scale: 'medium',
                handler: function () {
                    if (!me.allowBlank && me.selections.length == 0) {
                        Cxt.util.Toast.warning('请至少选择一条数据');
                    } else {
                        me.fireEvent('select', me, me.selections);
                        me.close();
                    }
                }
            }, {
                xtype: 'button',
                text: '取消',
                width: 80,
                scale: 'medium',
                handler: function () {
                    me.fireEvent('cancel', me);
                    me.close();
                }
            }, '->']
        });

        Ext.apply(me, {
            selections: [],
            dockedItems: dockedItems,
            items: [{
                xtype: 'grid',
                itemId: 'grid',
                store: store,
                maxHeight: me.gridMaxHeight,
                selModel: me.selModel,
                columns: me.columns,
                listeners: {
                    select: function (grid, records) {
                        var selModel = me.down('#grid').view.selModel;
                        if (selModel['mode'] == 'SINGLE') {
                            me.selections.length = 0;
                        }
                        Ext.Array.each(records, function (record) {
                            if (!Ext.Array.findBy(me.selections, function (item) {
                                    return me.isRecordMatch(item, record.getData());
                                })) {
                                me.selections.push(record.getData());
                            }
                        });
                        me.refreshTakeCount();
                    },
                    deselect: function (grid, records) {
                        Ext.Array.each(records, function (record) {
                            Ext.Array.remove(me.selections, Ext.Array.findBy(me.selections, function (item) {
                                return me.isRecordMatch(item, record.getData());
                            }));
                        });
                        me.refreshTakeCount();
                    }
                }

            }]
        });

        me.callParent(arguments);
    },

    createStore: function () {
        var me = this;

        if (Ext.isEmpty(me.queryUrl)) {
            Ext.raise("You must specify a queryUrl config.");
        }

        return Ext.create('Ext.data.Store', {
            type: 'store',
            remoteFilter: true,
            remoteSort: true,
            pageSize: me.pageSize,
            sorters: me.sorters,
            proxy: {
                type: 'ajax',
                url: me.queryUrl,
                actionMethods: {read: 'POST'},
                limitParam: 'pageSize',
                pageParam: 'page',
                startParam: '',
                paramsAsJson: true,
                extraParams: {},
                reader: {
                    type: 'queryResult',
                    rootProperty: 'records',
                    totalProperty: 'recordCount'
                }
            },
            listeners: {
                beforeload: function (store, operation, eOpts) {
                    if (me.fireEvent('beforestoreload', store, operation, eOpts) === false) {//通常用于限制项目
                        return false;
                    } else {
                        me.buildExtraParams(store);
                        store.fireEvent('load', store);
                    }
                },
                load: function (store, records, successful, operation) {
                    var selModel = me.down('#grid').view.selModel;
                    if (me.keepSelect) {
                        selModel.setSelected(me.selections);
                        if (Ext.isEmpty(records) == false) {
                            Ext.Array.each(me.selections, function (selection) {
                                selModel.select(Ext.Array.findBy(records, function (record) {
                                    return me.isRecordMatch(selection, record.getData());
                                }), true, true)
                            });
                        } else {
                            selModel.deselectAll(true);
                            me.selections.length = 0;
                        }
                    } else {
                        selModel.deselectAll(true);
                        me.selections.length = 0;
                    }
                    me.refreshTakeCount();
                    me.fireEvent('storeload', me, records, successful, operation);
                }
            }
        });
    },

    buildFilters: function () {
        var me = this,
            items = [];

        Ext.Array.each(me.conditions, function (condition) {
            if (Ext.isEmpty(condition))
                return;

            var bind = Ext.apply({}, {
                    value: '{conditions.filter.' + condition.fieldName + '}'
                }, condition.bind),
                listeners = Ext.apply({}, {
                    hide: function () {
                        me.getViewModel().set('conditions.filter.' + condition.fieldName, null);
                    }
                }, condition.listeners);

            Ext.applyIf(condition, {
                columnWidth: .33,
                labelWidth: me.labelWidth
            });

            Ext.apply(condition, {
                itemId: 'condition' + condition.fieldName,
                bind: bind,
                listeners: listeners
            });
            items.push(condition);
        });

        if (items.length) {
            items.push({
                xtype: 'fieldcontainer',
                labelWidth: me.labelWidth,
                fieldLabel: '&nbsp',
                labelSeparator: '&nbsp',
                items: [{
                    xtype: 'button',
                    iconCls: 'fa fa-search',
                    text: ' 搜索',
                    ui: 'primary',
                    handler: function () {
                        me.doSearch();
                    }
                }, {
                    xtype: 'button',
                    iconCls: 'fa fa-close',
                    ui: 'default-toolbar',
                    text: '清除',
                    margin: '0 0 0 5',
                    handler: function () {
                        me.clearConditions();
                    }
                }]
            });
        }

        return me.filterPanel = Ext.widget({
            xtype: 'form',
            dock: 'top',
            width: '100%',
            sequence: 100,
            hidden: items.length == 0,
            items: items
        });
    },

    buildCounter: function () {
        var me = this;
        return {
            xtype: 'toolbar',
            width: '100%',
            dock: 'top',
            ui: 'embed',
            sequence: 200,
            hidden: !me.keepSelect,
            items: [{
                xtype: 'displayfield',
                value: '&nbsp'
            }, {
                xtype: 'label',
                itemId: 'takeCount',
                margin: '0 15 0 25',
                html: '共 <span style="color:#5FA2DD;"> 0 </span> 条'
            }, {
                xtype: 'displayfield',
                itemId: 'clearSelections',
                linkable: true,
                hidden: true,
                value: '清空',
                listeners: {
                    click: function () {
                        me.selections.length = 0;
                        me.down('#grid').view.selModel.deselectAll();
                    }
                }
            }]
        }
    },

    onShow: function () {
        var me = this;
        me.callParent(arguments);
        me.doSearch();
    },

    refreshTakeCount: function () {
        if (this['destroyed'] || !this.keepSelect)
            return;

        var me = this,
            takeCount = me.down('#takeCount'),
            grid = me.down('#grid'),
            gridView = grid.getView(),
            gridEl = gridView.getEl();

        var scrollTop = gridEl.getScrollTop();//记录滚动条位置
        if (me.selections.length > 0) {
            me.down('#clearSelections').show();
            takeCount.setHtml('已选 <span style="color:#5FA2DD;">' + me.selections.length + '</span> 条');
            Ext.tip.QuickTipManager.register({
                target: takeCount.el,
                text: Ext.util.Format.list(me.selections, ';', me.takeCountTpl),
                dismissDelay: 10000
            });
        } else {
            me.down('#clearSelections').hide();
            var totalCount = me.down('#grid').getStore().totalCount ? me.down('#grid').getStore().totalCount : 0;
            takeCount.setHtml('共 <span style="color:#5FA2DD;">' + totalCount + '</span> 条');
            Ext.tip.QuickTipManager.unregister(takeCount.el);
        }
        gridEl.setScrollTop(scrollTop);//恢复滚动条位置
    },

    clearConditions: function () {
        var me = this;
        var conditions = me.getViewModel().get('conditions.filter');
        for (var condition in conditions) {
            conditions[condition] = null;
        }
        me.getViewModel().set('conditions.filter', conditions);
        me.filterPanel.clearInvalid();
    },

    doSearch: function () {
        var me = this,
            store = me.down('#grid').getStore();
        if (!me.rendered) {
            return;
        } else if (!me.filterPanel.isValid()) {
            return;
        }

        if (store.isLoading()) {
            store.getProxy().terminate();
        }

        me.buildExtraParams(store);
        store.load();
    },

    buildExtraParams: function (store) {
        var me = this,
            filter = Ext.apply({}, me.getViewModel().get('conditions.filter'));
        filter = me.supplyFilter(filter);
        store.getProxy().setExtraParams({
            filter: filter,
            querySummary: me.querySummary,
            fetchParts: Ext.isEmpty(me.fetchParts) ? [] : Ext.Array.from(me.fetchParts)
        });
    },

    supplyFilter: function (filter) {
        var me = this;
        filter = Ext.valueFrom(filter, {});
        if (Ext.isEmpty(me.expects) == false) {
            filter.expects = me.expects;
        }
        return filter;
    },

    setExpects: function (expects) {
        var me = this;
        me.expects = expects;
        delete me.lastQuery;
    },

    isRecordMatch: function (item, other) {
        return item['uuid'] == other['uuid'];
    }
});