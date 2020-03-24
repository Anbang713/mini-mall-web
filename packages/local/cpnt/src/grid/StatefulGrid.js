/**
 * 支持带状态的搜索条件的表格
 * 用户只需要进行搜索条件设置，列显示设置，动作设置即可有表格处理剩余事情。
 * 更多可设置内容查看config注释。
 *
 * Created by cRazy on 2016/6/26.
 */
Ext.define('Cpnt.grid.StatefulGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'grid.stateful',

    requires: [
        'Cpnt.grid.field.SearchTag',
        'Cpnt.grid.field.SearchTagPicker',
        'Cxt.data.reader.QueryResultReader',
        'Cxt.form.field.TagSelector',
        'Cxt.menu.AuthorItem',
        'Cxt.util.LocalStorage',
        'Ext.button.Button',
        'Ext.data.Store',
        'Ext.data.proxy.Ajax',
        'Ext.form.FieldContainer',
        'Ext.form.Label',
        'Ext.form.Panel',
        'Ext.form.field.ComboBox',
        'Ext.grid.feature.Grouping',
        'Ext.layout.container.Column',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Fill',
        'Ext.toolbar.Paging',
        'Ext.toolbar.Separator'
    ],

    pageSize: 100,

    /**
     * 自定义分页
     */
    customPaging: false,

    /**
     * 默认不显示竖线
     */
    columnLines: false,

    /**
     * vbox
     */
    layout: 'vbox',
    heightFill: true,

    /**
     * 表格遮罩
     */
    maskElement: 'body',
    viewModel: {
        data: {
            conditions: {collapse: false}
        },
        formulas: {}
    },

    defaults: {
        // 默认高度，实现行间距
        margin: 1
    },

    lockedGridConfig: {
        maxWidth: 600
    },

    /**
     * @cfg {Boolean} simpleSearch
     * 设置为true后，简化搜索按钮。
     */
    simpleSearch: false,

    /**
     * @cfg {Object/Object[]} tagSelectors
     * tag选择方案
     *     @example
     *     tagSelectors: [{
     *          selector:'bizState',// 选择的查询字段
     *          caption:'状态'// 字段标题
     *          mode:'DEFAULT',// 选择方案。
     *          tags:[{
     *              tag: 'ineffect',
     *              tagCaption: '未生效',
     *              main: true
     *          }, {
     *              tag: 'effect',
     *              tagCaption: '已生效',
     *              main: true
     *          }],
     *     }]
     */
    tagSelectors: undefined,

    /**
     * @cfg {String} queryUrl
     * 查询数据对应的queryUrl。也可以直接定义store
     */
    queryUrl: undefined,

    /**
     * @cfg {Object[]} conditions
     * 搜索条件列表。每个搜索条件都是一个表单控件。通过fieldName来进行条件搜索
     * 可设置exclude=true，时，将跳过该条件
     *     @example
     *     operations: [{
     *             xtype: 'textfield',
     *             fieldName: 'billNumber',
     *             fieldLabel: '单号',
     *             hidden: false，
     *             exclude: true/'ineffect'/['ineffect','effect']
     *        }],
     */
    conditions: undefined,

    /**
     * @cfg {Object[]/Ext.panel.Tool[]} tools
     *
     */
    auxiliaryTools: undefined,

    /**
     * @cfg {Object[]} operations
     * 定义的动作控件列表。
     *     @example
     *     operations: [{
     *            xtype: 'button', // 默认设置为button，可覆盖
     *            action: 'effect', // 按钮动作
     *            text: '生效', // 按钮标题
     *            batchable: true, // 是否批处理
     *            actionLimits:[{ // 限制。
     *                limitedTo:'bizState'// 显示状态受tag选择
     *                srcStates: ['ineffect'], // 来源状态。当搜索的状态不匹配时，将自动隐藏。设置了limitedTo之后有效
     *            }]
     *            ui: 'primary'// 按钮ui。
     *        }],
     */
    operations: undefined,

    /**
     * @cfg {Object[]} defaultSort
     * 默认排序字段
     *     @example
     *     defaultSort: {
     *          property:billNumber,
     *          direction:DESC,
     *     }
     */
    defaultSort: undefined,

    /**
     * @cfg {String} defaultGroup
     * 默认分组字段
     */
    defaultGroup: undefined,

    /**
     * @cfg {boolean} showConditionMenu
     * 显示条件扩展菜单
     */
    showConditionMenu: true,

    /**
     * @cfg {Ext.selection.Model/Object/String} [selModel=rowmodel]
     * 默认使用多选
     */
    selModel: {
        selType: 'checkboxmodel',
        width: 50
    },

    /**
     *
     * @cfg {Ext.grid.feature.Feature[]/Object[]/Ext.enums.Feature[]} features
     * 提供默认的分组方案
     */
    features: [{
        ftype: 'grouping',
        groupHeaderTpl: '{columnName}: {name} (数量 {rows.length})',
        startCollapsed: false//默认展开折叠面板
    }],

    /**
     * @cfg {Function} supplyFilter
     * 搜索前队filter的处理，允许外部调用者增加新的搜索条件而不影响viewModel
     */
    supplyFilter: Ext.identityFn,

    /**
     * @cfg {Function} raiseContextMenuItems
     * 调用者可以重写该方法来增加右键菜单
     */
    raiseContextMenuItems: Ext.emptyFn,

    /**
     * @cfg {Function} applyBatchAction
     * 调用者可以重写该方法来觉得按钮是否适配。
     */
    applyBatchAction: Ext.emptyFn,

    /**
     * @cfg {Function} applyContextMenu
     * 调用者可以重写该方法来觉得按钮是否适配
     */
    applyContextMenu: Ext.emptyFn,

    /**
     * 默认的搜索条件
     * 可以是对象也可以是函数
     */
    defaultConditions: undefined,

    userId: 'admin',

    /**
     * @cfg {boolean} localStorage
     * 每次搜索之后，是否本地保存搜索条件
     */
    localStorage: true,

    /**
     * 初始化
     */
    initComponent: function () {
        var me = this,
            store = me.createStore(),
            dockedItems = Ext.Array.from(me.dockedItems),
            filterPanel = me.createFilter(),
            conditionTagPanel = me.createConditionTagPanel(),
            operationBar = me.createOperationBar();

        me.initColumns();

        dockedItems.push(Ext.apply(filterPanel, {
            sequence: 100,
            dock: 'top',
            width: '100%'
        }));
        dockedItems.push(Ext.apply(conditionTagPanel, {
            sequence: 200,
            dock: 'top',
            width: '100%'
        }));
        dockedItems.push(Ext.apply(operationBar, {
            sequence: 300,
            dock: 'top',
            width: '100%'
        }));
        if (Ext.isEmpty(me.pageSize) == false && me.pageSize != 0 && !me.customPaging) {
            dockedItems.push({
                xtype: 'pagingtoolbar',
                store: store,
                dock: 'bottom',
                displayInfo: true
            });
        } else if (Ext.isEmpty(me.pageSize) == false && me.pageSize != 0 && me.customPaging) {
            dockedItems.push({
                xtype: 'pagingtoolbar',
                itemId: 'pageMessage',
                dock: 'bottom',
                displayInfo: true,
                items: ['-', '每页', {
                    xtype: 'combobox',
                    displayField: 'id',  　　  　//获取的内容
                    valueField: 'value',　　　 　//显示的内容
                    editable: false,　　　　  　　//不允许编辑只能选择
                    allowBlank: false,　　　　 　 //不允许为空
                    triggerAction: 'all',      //请设置为”all”,否则默认 为”query”的情况下，你选择某个值后，再此下拉时，只出现匹配选项，
                                               //如果设为”all”的话，每次下拉均显示全部选项
                    width: 60,
                    listeners: {
                        render: function (comboBox) {
                            comboBox.setValue(comboBox.ownerCt.getStore().getPageSize() ? comboBox.ownerCt.getStore().getPageSize() : 100);   //使得下拉菜单的默认值是初始值
                        },
                        select: function (comboBox) {
                            var pSize = comboBox.getValue();
                            comboBox.ownerCt.getStore().pageSize = parseInt(pSize); //改变PagingToolbar的pageSize 值
                            comboBox.ownerCt.getStore().load({start: 0, limit: parseInt(pSize)});
                        }
                    },
                    queryMode: 'local',
                    store: {
                        fields: ['id', 'value'],
                        data: [['20', 20], ['50', 50], ['100', 100], ['200', 200], ['500', 500]]
                    }
                }, '条'],
                store: store　　　　// GridPanel中使用的数据
            });
        }

        Ext.apply(me, {
            store: store,
            dockedItems: dockedItems,
            width: '100%'
        });

        me.callParent(arguments);

        me.on('itemcontextmenu', me.onItemContextMenu);
        me.on('headercontextmenu', me.onHeaderContextMenu);
    },

    afterRender: function () {
        var me = this,
            filter = {};
        me.callParent(arguments);

        // 设置tag的默认值
        Ext.Array.each(me.tagSelectors, function (tagSelector) {
            if (tagSelector.value) {
                filter[tagSelector.selector] = tagSelector.value;
            }
        });
        me.resetConditionDefaults({
            filter: filter
        });
    },

    resetConditionDefaults: function (conditions) {
        var me = this,
            defaultConditions = me.defaultConditions,
            filter = Ext.valueFrom(me.getViewModel().get('conditions.filter'), {}),
            rawValue = {},
            field;
        conditions = Ext.valueFrom(conditions, {});
        if (Ext.isFunction(defaultConditions)) {
            defaultConditions = defaultConditions();
        }
        defaultConditions = Ext.valueFrom(defaultConditions, {});

        for (field in filter) {
            filter[field] = null;
        }
        Ext.apply(filter, defaultConditions.filter, conditions.filter);
        Ext.apply(rawValue, defaultConditions.rawValue, conditions.rawValue);

        for (field in filter) {// 因为viewModel有延时，所以需要先调用setValue来设值
            if (me.down('#condition' + field)) {
                me.down('#condition' + field).setValue(filter[field]);
                if (!rawValue[field]) {
                    rawValue[field] = me.down('#condition' + field).getRawValue();
                }
            }
        }
        me.getViewModel().set('conditions.filter', filter);
        me.getViewModel().set('conditions.rawValue', rawValue);
    },

    /** 对列进行初始化设置*/
    initColumns: function () {
        var me = this,
            total = 0;
        Ext.Array.each(me.columns, function (column) {
            if (!column.minWidth && column.width) {// 兼容
                column.minWidth = column.width;
                delete column.width;
            }
            if (Ext.isString(column.minWidth)) {
                if (column.minWidth.endsWith('px')) {
                    column.minWidth = column.minWidth.substr(0, column.minWidth.length - 2) - 0;
                } else {
                    column.minWidth = column.minWidth - 0;
                }
            }
            total = total.add(column.minWidth);
            if (column.menuDisabled == undefined) {// 只有明确禁用了菜单项的，才禁用，否则由于默认禁用，该处需要启用
                column.menuDisabled = false;
            }
        });

        Ext.Array.each(me.columns, function (column) {
            if (column.minWidth) {
                column.flex = column.minWidth.divide(total, 2);
            }
        });
        // 备份列设置
        me.backups = {
            columns: Ext.clone(me.columns)
        };
    },

    loadLocalSearch: function () {
        var me = this,
            field;
        if (!me.localStorage)
            return me.doSearch();

        var searchConfig = Ext.decode(Cxt.util.LocalStorage.get(me.userId + "@" + me.filterGroupId), true);
        me.doSearch(searchConfig);
        me.getViewModel().set('conditions.collapse', false);
    },

    /**
     * 执行查询操作
     */
    doSearch: function (searchConfig) {
        var me = this,
            filter;
        if (!me.rendered) {
            return;
        }

        if (!!searchConfig) {// 搜索的设置需要设置。重新加载的时候取最新的设置
            if (!!searchConfig.conditions) {
                me.getViewModel().set('conditions', searchConfig.conditions);
            }
        } else if (!me.filterPanel.isValid()) {
            return;
        }

        if (me.getStore().isLoading()) {
            me.getStore().getProxy().terminate();
        }

        filter = Ext.apply({}, me.getViewModel().get('conditions.filter'));
        if (Ext.isFunction(me.supplyFilter)) {
            filter = me.supplyFilter(filter);
        }

        me.getStore().getProxy().setExtraParams({
            querySummary: true,
            filter: filter,
            fetchParts: me.fetchParts
        });

        me.getStore().load();
        me.localStoreSearch();
    },

    /**
     *  搜索条件本地缓存
     *
     */
    localStoreSearch: function () {
        var me = this,
            columns = [],
            conditions = me.getViewModel().get('conditions');

        if (!me.localStorage)
            return;

        Ext.Array.each(me.getColumns(), function (column) {
            columns.push({
                dataIndex: column.dataIndex,
                width: column.width,
                text: column.text,
                locked: column.locked,
                hidden: column.hidden,
                hideable: column.hideable
            })
        });

        Cxt.util.LocalStorage.set(me.userId + "@" + me.filterGroupId, Ext.encode({
            conditions: conditions
        }));
    },

    /**
     * 刷新总数
     */
    refreshTakeCount: function () {
        if (this.destroyed)
            return;

        var me = this,
            selectCount = me.getSelection().length;
        if (selectCount && me.selModel.mode === 'MULTI') {
            me.down('#takeCount').setHtml('已选 <span style="color:#5FA2DD;">' + selectCount + '</span> 条');
        } else {
            var totalCount = me.getStore().totalCount;
            if (Ext.isEmpty(totalCount)) {
                totalCount = 0;
            }
            me.down('#takeCount').setHtml('共 <span style="color:#5FA2DD;">' + totalCount + '</span> 条');
        }
    },

    /**
     *  刷新动作按钮显示隐藏
     */
    refreshBatchAction: function () {
        var me = this;

        Ext.Array.each(me.batchActions, function (operation) {
            var itemId = 'btn';
            if (operation.action && operation.action.key) {
                itemId = itemId + operation.action.key;
            } else {
                itemId = itemId + operation.action;
            }

            var actionBtn = me.down('#' + itemId),
                records = me.getSelection(),
                hide = false;
            if (Ext.isEmpty(actionBtn)) {
                return;
            }
            Ext.Array.each(actionBtn.actionLimits, function (item) {
                if (Ext.isEmpty(item.limitedTo)) {
                    return;
                }

                Ext.Array.each(records, function (record) {
                    if (!Ext.Array.contains(item.srcStates, record.get(item.limitedTo))) {
                        return hide = true;
                    }
                });
            });

            if (me.applyBatchAction(actionBtn, records) === false) {
                hide = true;
            }
            actionBtn.setHidden(hide);
        });
    },

    /** 增加批处理按钮*/
    raiseBatchActions: function (actions) {
        var me = this,
            additionalToolbar = me.down('#additionalToolbar');
        additionalToolbar.removeAll();
        if (Ext.isEmpty(actions))
            return;

        additionalToolbar.add('-');
        additionalToolbar.add(actions);
    },

    /**
     *  清除条件
     */
    clearConditions: function () {
        var me = this,
            defaultConditions = me.defaultConditions,
            filter, rawValue, field;
        if (Ext.isFunction(defaultConditions)) {
            defaultConditions = defaultConditions();
        }
        defaultConditions = Ext.valueFrom(defaultConditions, {});
        filter = Ext.valueFrom(defaultConditions.filter, {});
        rawValue = Ext.valueFrom(defaultConditions.rawValue, {});

        // 构建条件标签
        Ext.Array.each(me.conditions, function (condition) {
            var field = me.down('#condition' + condition.fieldName);
            if (field) {
                if (field.allowBlank) {// 如果是非必填，则应该清掉
                    delete filter[condition.fieldName];
                    delete rawValue[condition.fieldName];
                }
                field.setValue(filter[condition.fieldName]);
                field.isValid();
                if (filter[condition.fieldName]) {
                    rawValue[condition.fieldName] = field.getRawValue();
                }
            }
        });

        me.getViewModel().set('conditions.filter', Ext.apply({}, filter));
        me.getViewModel().set('conditions.rawValue', Ext.apply({}, rawValue));
        me.filterPanel.isValid();
    },

    /** 展开*/
    conditionsExpand: function () {
        var me = this;
        me.getViewModel().set('conditions.collapse', false);
    },

    /** 收起*/
    conditionsCollapse: function () {
        var me = this,
            buttons = [];
        me.getViewModel().set('conditions.collapse', true);
        // 构建tag搜索的条件标签
        Ext.Array.each(me.tagSelectors, function (tagSelector) {
            var tags = me.getViewModel().get('conditions.filter.' + tagSelector.selector),
                clearable = tagSelector.allowBlank;
            buttons.push({
                xtype: 'searchtagpicker',
                width: 150,
                tagSelector: tagSelector,
                selection: tags,
                clearable: clearable,
                listeners: {
                    close: function () {
                        me.getViewModel().set('conditions.filter.' + tagSelector.selector, null);
                        me.conditionsExpand();
                        me.doSearch();
                    },
                    select: function (picker, selections) {
                        me.getViewModel().set('conditions.filter.' + tagSelector.selector, selections);
                        me.excludeConditions();
                        me.doSearch();
                    }
                }
            });
        });
        // 构建条件标签
        Ext.Array.each(me.conditions, function (condition) {
            var rawValue = me.getViewModel().get('conditions.rawValue.' + condition.fieldName),
                clearable = condition.allowBlank !== false;
            if (!Ext.isEmpty(rawValue)) {
                buttons.push({
                    xtype: 'searchtag',
                    tagLabel: condition.fieldLabel,
                    value: rawValue,
                    itemId: 'searchtag' + condition.fieldName,
                    clearable: clearable,
                    listeners: {
                        close: function () {
                            me.getViewModel().set('conditions.filter.' + condition.fieldName, null);
                            me.getViewModel().set('conditions.rawValue.' + condition.fieldName, null);
                            me.conditionsExpand();
                            me.doSearch();
                        }
                    }
                });
            }
        });

        buttons.push({
            xtype: 'button',
            iconCls: 'fa fa-close',
            ui: 'bulge',
            text: '清空',
            handler: function () {
                me.clearConditions();
                me.conditionsExpand();
                me.doSearch();
            }
        });

        me.suspendLayouts(); //挂起渲染
        me.down('#filterTagToolbar').removeAll();
        me.down('#filterTagToolbar').add(buttons);
        me.resumeLayouts(true); //布局配置刷新完毕后再恢复统一构造
    },

    excludeConditions: function () {
        var me = this;

        Ext.Array.each(me.conditions, function (condition) {
            if (condition.exclude && condition.exclude !== true) {
                var list = Ext.Array.from(condition.exclude),
                    visible = true;
                Ext.Array.each(me.tagSelectors, function (tagSelector) {
                    var tags = me.getViewModel().get('conditions.filter.' + tagSelector.selector);
                    return visible = Ext.Array.intersect(list, tags).length == 0;
                });

                if (visible) {
                    if (me.down('#conditionMenu' + condition.fieldName).isHidden()) {
                        me.down('#conditionMenu' + condition.fieldName).show();
                        me.getViewModel().set('conditions.visible.' + condition.fieldName,
                            me.getViewModel().get('conditions.backup.visible.' + condition.fieldName) != false);
                    }
                } else {
                    me.down('#conditionMenu' + condition.fieldName).hide();
                    if (me.down('#searchtag' + condition.fieldName))
                        me.down('#searchtag' + condition.fieldName).hide();
                    // 记录一下原状态，用于支持的时候的显隐设置
                    me.getViewModel().set('conditions.backup.visible.' + condition.fieldName,
                        me.getViewModel().get('conditions.visible.' + condition.fieldName));
                    me.getViewModel().set('conditions.visible.' + condition.fieldName, false);
                    me.getViewModel().set('conditions.filter.' + condition.fieldName, null);
                    me.getViewModel().set('conditions.rawValue.' + condition.fieldName, null);
                }
            }
        });
    },

    createStore: function () {
        var me = this,
            store = me.store;
        if (Ext.isEmpty(store)) {
            store = {
                proxy: {
                    type: 'ajax',
                    url: me.queryUrl,
                    actionMethods: {
                        read: 'POST'
                    },
                    limitParam: 'pageSize',
                    pageParam: 'page',
                    paramsAsJson: true,
                    reader: 'queryResult'
                },
                groupField: Ext.isEmpty(me.defaultGroup) ? undefined : me.defaultGroup,
                sorters: Ext.isEmpty(me.defaultSort) ? undefined : [me.defaultSort],
                remoteSort: true,
                remoteFilter: true,
                autoLoad: false,
                pageSize: me.pageSize,
                listeners: {
                    load: function (store, records, successful, operation) {
                        if (!Ext.isEmpty(operation.getResultSet())) {
                            me.getViewModel().set('tagExtras', operation.getResultSet().summary);
                        }
                        me.refreshTakeCount();
                        me.fireEvent('storeload', me, records, successful, operation);
                    },
                    scope: me
                }
            };
        }
        return Ext.create('Ext.data.Store', store);
    },

    /**
     *  创建过滤栏
     */
    createFilter: function () {
        var me = this,
            tagSelectorFields = [],
            conditionMenu = [],
            tools;

        Ext.Array.each(me.tagSelectors, function (tagSelector) {
            tagSelector = Ext.apply({}, tagSelector, {
                xtype: 'tagselector',
                tagWidth: (tagSelector.tags.length + 1) * 120,
                listeners: {
                    tagChange: function (selector, tags) {
                        me.getViewModel().set('conditions.filter.' + tagSelector.selector, tags);
                        me.excludeConditions();
                        me.doSearch();
                    }
                },
                bind: {
                    value: '{conditions.filter.' + tagSelector.selector + '}',
                    tagExtras: '{tagExtras}'
                }
            });

            tagSelectorFields.push(Ext.apply(tagSelector, {
                columnWidth: 1,
                fieldLabel: tagSelector.caption,
                labelAlign: 'right'
            }));
        });

        Ext.Array.each(me.conditions, function (condition) {
            if (Ext.isEmpty(condition) || condition.exclude === true)
                return;

            var bind = Ext.apply({
                    hidden: '{!conditions.visible.' + condition.fieldName + '}',
                    value: '{conditions.filter.' + condition.fieldName + '}',
                    rawValue: '{conditions.rawValue.' + condition.fieldName + '}'
                }, condition.bind),
                listeners = Ext.apply({}, {
                    blur: function (field) {
                        var rawValue = field.getRawValue();
                        me.getViewModel().set('conditions.rawValue.' + condition.fieldName, rawValue);
                        if (field.queryAsValue) {
                            me.getViewModel().set('conditions.filter.' + condition.fieldName, rawValue);
                        }
                    },
                    hide: function () {
                        me.getViewModel().set('conditions.filter.' + condition.fieldName, null);
                        me.getViewModel().set('conditions.rawValue.' + condition.fieldName, null);
                    }
                }, condition.listeners);

            Ext.apply(condition, {
                itemId: 'condition' + condition.fieldName,
                columnWidth: .33,
                bind: bind,
                listeners: listeners
            });
            if (condition.allowBlank !== false) {
                conditionMenu.push({
                    checked: !condition.hidden,
                    hideOnClick: false,
                    text: condition.fieldLabel,
                    fieldName: condition.fieldName,
                    itemId: 'conditionMenu' + condition.fieldName,
                    bind: {
                        checked: '{conditions.visible.' + condition.fieldName + '}'
                    },
                    listeners: {
                        checkchange: function (checkItem, checked) {
                            var me = this;
                            me.getViewModel().set('conditions.visible.' + condition.fieldName, checked);
                        },
                        scope: me
                    }
                });
            }
        });

        var toolbar = {
            xtype: 'toolbar',
            ui: 'embed',
            items: [{
                xtype: 'button',
                iconCls: 'fa fa-search',
                text: ' 搜索',
                ui: 'primary',
                listeners: {
                    click: function () {
                        me.doSearch();
                    }
                }
            }, {
                iconCls: 'fa fa-close',
                text: '清除',
                listeners: {
                    click: me.clearConditions,
                    scope: me
                }
            }]
        };

        if (!me.simpleSearch) {
            Ext.Array.push(toolbar.items, [{
                xtype: 'tbseparator',
                hidden: !me.showConditionMenu
            }, {
                iconCls: 'fa fa-plus',
                menu: conditionMenu,
                hidden: !me.showConditionMenu
            }], me.auxiliaryTools, ['->', {
                text: '收起',
                iconCls: 'fa fa-angle-double-up',
                ui: 'bulge',
                listeners: {
                    click: me.conditionsCollapse,
                    scope: me
                }
            }]);
        }

        return me.filterPanel = Ext.widget({
            xtype: 'form',
            bind: {
                hidden: '{conditions.collapse}'
            },
            items: Ext.Array.merge(
                tagSelectorFields,// 选择器
                me.conditions,// 条件
                {
                    xtype: 'fieldcontainer',
                    columnWidth: 1,
                    fieldLabel: '&nbsp;',
                    labelSeparator: '&nbsp;',
                    items: [toolbar]
                })
        });
    },

    createConditionTagPanel: function () {
        var me = this;

        return {
            xtype: 'toolbar',
            width: '100%',
            padding: '0 0 0 100',
            bind: {
                hidden: '{!conditions.collapse}'
            },
            items: [{
                xtype: 'toolbar',
                width: '80%',
                layout: 'column',
                itemId: 'filterTagToolbar',
                ui: 'embed',
                defaults: {
                    margin: '2 3 2 3'
                }
            }, '->', {
                text: '展开',
                iconCls: 'fa fa-angle-double-down',
                ui: 'bulge',
                listeners: {
                    click: me.conditionsExpand,
                    scope: me
                }
            }]
        }
    },

    /**
     * 创建工具栏
     */
    createOperationBar: function () {
        var me = this,
            batchActions = [];

        Ext.Array.each(me.operations, function (operation) {
            if (operation.batchable != true)
                return;

            var itemId = 'btn';
            if (operation.action && operation.action.key) {
                itemId = itemId + operation.action.key;
            } else {
                itemId = itemId + operation.action;
            }

            batchActions.push(Ext.apply({
                itemId: itemId,
                listeners: {
                    click: function (button) {
                        me.fireEvent('batchaction', button.action, button.text, me.getSelection());
                    },
                    scope: me
                }
            }, operation));
        });

        me.batchActions = batchActions;
        return me.operationbar = Ext.widget({
            xtype: 'toolbar',
            width: '100%',
            border: true,
            style: 'border:0px;border-top:1px solid #E8E8E8',
            items: [{
                xtype: 'toolbar',
                ui: 'embed',
                height: 35,
                itemId: 'operationbar-left',
                items: [{
                    xtype: 'label',
                    itemId: 'takeCount',
                    margin: '0 15 0 25',
                    html: '共 <span style="color:#5FA2DD;"> 0 </span> 条'
                }, {
                    xtype: 'toolbar',
                    itemId: 'batchToolbar',
                    ui: 'embed',
                    items: me.batchActions
                }, {
                    xtype: 'toolbar',
                    itemId: 'additionalToolbar',
                    ui: 'embed'
                }]
            }]
        });
    },

    updateBindSelection: function () {
        var me = this;
        me.callParent(arguments);

        me.refreshTakeCount();
        me.refreshBatchAction();
    },

    resizeOperationSides: function () {
        if (!this.rendered || this.destroyed)
            return;
        var me = this,
            operationbar = me.operationbar,
            center = me.down('#operationbar-center'),
            left = me.down('#operationbar-left'),
            right = me.down('#operationbar-right');
        if (center.items.length == 0) {
            right.setFlex(1);
            return;
        }

        var width = (operationbar.getWidth() - center.getWidth() - 30) / 2;
        if (width > 0) {
            left.setWidth(width);
            right.setWidth(width);
        }
    },

    onHeaderContextMenu: function (ct, column, e) {
        e.preventDefault();
        if (column.menuDisabled)
            return;

        var menu = ct.getMenu(),
            ascItem = menu.down('#ascItem'),
            descItem = menu.down('#descItem'),
            sortableMth;

        // Use ownerCmp as the upward link. Menus *must have no ownerCt* - they are global floaters.
        // Upward navigation is done using the up() method.
        menu.activeHeader = menu.ownerCmp = column;
        column.setMenuActive(menu);

        // enable or disable asc & desc menu items based on header being sortable
        sortableMth = column.sortable ? 'enable' : 'disable';
        if (ascItem) {
            ascItem[sortableMth]();
        }
        if (descItem) {
            descItem[sortableMth]();
        }

        ct.showMenuBy(e, column.triggerEl, column);

        // Pointer-invoked menus do not auto focus, key invoked ones do.
        menu.showAt(e.getXY());

        // Menu show was vetoed by event handler - clear context
        if (!menu.isVisible()) {
            ct.onMenuHide(menu);
        }
    },

    onItemContextMenu: function (gridView, record, item, index, e) {
        e.preventDefault();

        var me = this,
            items = [];
        Ext.Array.each(me.operations, function (operation) {
            if (operation === '-') {
                return items.push(operation);
            }
            if (!operation.action)
                return;

            var use = true;
            if (!Ext.isEmpty(operation.actionLimits)) {
                Ext.Array.each(operation.actionLimits, function (actionLimit) {
                    var state = record.get(actionLimit.limitedTo);
                    if (!Ext.Array.contains(actionLimit.srcStates, state)) {
                        use = false;
                    }
                });
            }
            if (use == false)
                return;

            var item = Ext.apply({}, {
                xtype: 'authormenuitem',
                listeners: {
                    click: function (button) {
                        me.fireEvent('itemaction', button.action, button.text, record, button);
                    },
                    scope: me
                }
            }, operation);

            delete item.ui;// 右键菜单不需要ui
            if (me.applyContextMenu(item, record) !== false) {
                items.push(item);
            }
        });

        me.raiseContextMenuItems(items, record);
        if (Ext.isEmpty(items))
            return;

        me.contextMenu = Ext.widget('menu', {
            viewModel: {},
            closeAction: 'destroy',
            items: items
        });
        me.contextMenu.getViewModel().set('authorize', me.getViewModel().get('authorize'));
        me.contextMenu.showAt(e.getXY());
    },

    destroy: function () {
        var me = this;
        if (Ext.isEmpty(me.contextMenu) == false) {
            Ext.destroy(me.contextMenu);
        }
        me.callParent(arguments);
    }
});