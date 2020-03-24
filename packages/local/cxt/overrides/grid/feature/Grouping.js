/**
 * 针对表格的分组功能做了修改。
 * Created by cRazy on 2016/8/26.
 */
Ext.define('overrides.grid.feature.Grouping', {
    override: 'Ext.grid.feature.Grouping',

    requires: [
        'Ext.data.BufferedStore',
        'Ext.grid.header.Container',
        'Ext.menu.Separator'
    ],

    cancelGroupText: '取消分组',

    groupHeaderTpl: '{columnName}: {name} (数量 {rows.length})',
    hideGroupedHeader: true,
    startCollapsed: true,

    init: function () {
        var me = this,
            groupings = {};
        me.callParent(arguments);

        Ext.Array.each(me.grid.columns, function (column) {
            groupings[column.dataIndex] = me;
        });
        if (!me.view.ownerGrid.groupings) {
            me.view.ownerGrid.groupings = {};
        }
        Ext.apply(me.view.ownerGrid.groupings, groupings);
    },

    getMenuItems: function () {
        var me = this,
            groupByText = me.groupByText,
            disabled = me.disabled || !me.getGroupField(),
            cancelGroupText = me.cancelGroupText,
            enableNoGroups = me.enableNoGroups,
            getMenuItems = me.view.headerCt.getMenuItems;

        // runs in the scope of headerCt
        return function () {

            // We cannot use the method from HeaderContainer's prototype here
            // because other plugins or features may already have injected an implementation
            var o = getMenuItems.call(this);
            o.push({
                itemId: 'groupItemSeparator',
                xtype: 'menuseparator'
            }, {
                iconCls: Ext.baseCSSPrefix + 'group-by-icon',
                itemId: 'groupMenuItem',
                text: groupByText,
                handler: me.onGroupMenuItemClick,
                scope: me
            });
            if (enableNoGroups) {
                o.push({
                    itemId: 'groupToggleMenuItem',
                    text: cancelGroupText,
                    hidden: disabled,
                    handler: me.onGroupToggleMenuItemClick,
                    scope: me
                });
            }
            return o;
        };
    },

    onGroupMenuItemClick: function (menuItem, e) {
        var me = this,
            menu = menuItem.parentMenu,
            column = menu.activeHeader,
            grouping = me.grid.ownerGrid.groupings[column.dataIndex];
        grouping.columnGroup(column);
    },

    /**
     * Turn on and off grouping via the menu
     * @private
     */
    onGroupToggleMenuItemClick: function () {
        var me = this;
        me.view.ownerGrid.grouping.cancelGroup();
    },

    onColumnHideShow: function (headerOwnerCt, header) {
        var me = this,
            view = me.view,
            headerCt = view.headerCt,
            menu = headerCt.getMenu(),
            activeHeader = menu.activeHeader,
            groupMenuItem = menu.down('#groupMenuItem'),
            groupMenuMeth,
            colCount = me.grid.getVisibleColumnManager().getColumns().length,
            items, len, i;
        // "Group by this field" must be disabled if there's only one column left visible.
        if (activeHeader && groupMenuItem && false) {// showMenuBy 的时候会处理显影。这边不需要了
            groupMenuMeth = activeHeader.groupable === false || !activeHeader.dataIndex || me.view.headerCt.getVisibleGridColumns().length < 2 ? 'disable' : 'enable';
            groupMenuItem[groupMenuMeth]();
        }
        // header containing TDs have to span all columns, hiddens are just zero width
        // Also check the colCount on the off chance that they are all hidden
        if (view.rendered && colCount) {
            items = view.el.query('.' + me.ctCls);
            for (i = 0 , len = items.length; i < len; ++i) {
                items[i].colSpan = colCount;
            }
        }
    },

    /**
     * 按指定列进行分组
     */
    columnGroup: function (column) {
        var me = this,
            view = me.view,
            store = me.getGridStore();

        // Override分组不能使用远程排序
        if (!view.isGrouping) {
            me.storeRemoteSort = store.getRemoteSort();
            store.setRemoteSort(false);
        }

        if (store instanceof Ext.data.BufferedStore) {
            me.fireEvent('menuclick', me, column.stateId);
            return;
        }
        if (me.disabled) {
            me.lastGrouper = null;
            me.block();
            me.enable();
            me.unblock();
        }
        view.isGrouping = true;

        // First check if there is a grouper defined for the feature. This is
        // necessary
        // when the value is a complex type.
        // 配置groupIndex，寻找group
        var grouper = {};
        if (column.groupFn) {
            grouper = {
                property: column.dataIndex,
                groupFn: column.groupFn
            }
        } else {
            grouper = me.getGrouper(column.dataIndex);
        }

        view.ownerGrid.grouping = me;

        store.group(grouper || column.dataIndex);
        me.pruneGroupedHeader();
    },

    /**
     * 取消分组
     */
    cancelGroup: function () {
        var me = this,
            store = me.getGridStore();
        // Override取消分组的时候，需要还原排序方案。
        store.setRemoteSort(me.storeRemoteSort);
        me.disable();
    },

    /**
     * @Override
     *  重写该方法，取消groupToggleMenuItem的勾选
     */
    showMenuBy: function (clickEvent, t, header) {
        var me = this,
            menu = me.getMenu(),
            groupMenuItem = menu.down('#groupMenuItem'),
            groupItemSeparator = menu.down('#groupItemSeparator'),
            groupToggleMenuItem = menu.down('#groupToggleMenuItem'),
            isGrouped = me.grid.getStore().isGrouped(),
            validColumns;

        validColumns = Ext.Array.filter(me.grid.getVisibleColumns(), function (column) {
            return column.dataIndex;
        });
        if (header.groupable === false || validColumns.length < 2) {
            groupMenuItem.hide();
        } else {
            groupMenuItem.show();
        }

        if (groupToggleMenuItem) {
            groupToggleMenuItem.setHidden(!isGrouped, true);
            groupToggleMenuItem[isGrouped ? 'enable' : 'disable']();
        }
        groupItemSeparator.setHidden(groupMenuItem.hidden && groupToggleMenuItem.hidden);
        Ext.grid.header.Container.prototype.showMenuBy.apply(me, arguments);
    },

    /**
     * @Override
     *  重写该方法，取消groupToggleMenuItem的勾选
     */
    enable: function () {
        var me = this,
            view = me.view,
            store = me.getGridStore(),
            currentGroupedHeader = me.hideGroupedHeader && me.getGroupedHeader(),
            groupToggleMenuItem;

        view.isGrouping = true;
        if (view.lockingPartner) {
            view.lockingPartner.isGrouping = true;
        }

        me.disabled = false;

        if (me.lastGrouper) {
            store.group(me.lastGrouper);
            me.lastGrouper = null;
        }

        // Update the UI.
        if (currentGroupedHeader) {
            currentGroupedHeader.hide();
        }

        groupToggleMenuItem = me.view.headerCt.getMenu().down('#groupToggleMenuItem');
        if (groupToggleMenuItem) {
            groupToggleMenuItem.show();
        }
    },

    /**
     * @Override
     *  重写该方法，取消groupToggleMenuItem的勾选
     */
    disable: function () {
        var me = this,
            view = me.view,
            store = me.getGridStore(),
            currentGroupedHeader = me.hideGroupedHeader && me.getGroupedHeader(),
            lastGrouper = store.getGrouper(),
            groupToggleMenuItem;


        view.isGrouping = false;
        if (view.lockingPartner) {
            view.lockingPartner.isGrouping = false;
        }

        me.disabled = true;

        if (lastGrouper) {
            me.lastGrouper = lastGrouper;
            store.clearGrouping();
        }

        // Update the UI.
        if (currentGroupedHeader) {
            currentGroupedHeader.show();
        }

        groupToggleMenuItem = me.view.headerCt.getMenu().down('#groupToggleMenuItem');
        if (groupToggleMenuItem) {
            groupToggleMenuItem.hide();
        }
    },

    /** @Override
     *
     * @param record
     * @param idx
     * @param rowValues
     */
    setupRowData: function (record, idx, rowValues) {
        var me = this,
            grid = me.grid;
        grid = grid.ownerLockable || grid;
        var recordIndex = rowValues.recordIndex,
            data = me.refreshData,
            metaGroupCache = me.getCache(),
            header = data.header,
            groupField = data.groupField,
            store = me.getGridStore(),
            dataSource = me.view.dataSource,
            isBufferedStore = dataSource.isBufferedStore,
            group = record.group,
            column = grid.columnManager.getHeaderByDataIndex(groupField), // Override此处应该是Ext的bug。
            hasRenderer = !!(column && column.renderer),
            grouper, groupName, prev, next, items;

        rowValues.isCollapsedGroup = false;
        rowValues.summaryRecord = rowValues.groupHeaderCls = null;

        if (data.doGrouping) {
            grouper = store.getGrouper();
            // This is a placeholder record which represents a whole collapsed group
            // It is a special case.
            if (record.isCollapsedPlaceholder) {
                groupName = group.getGroupKey();
                items = group.items;
                rowValues.isFirstRow = rowValues.isLastRow = true;
                rowValues.groupHeaderCls = me.hdCollapsedCls;
                rowValues.isCollapsedGroup = rowValues.needsWrap = true;
                rowValues.groupName = groupName;
                rowValues.metaGroupCache = metaGroupCache;
                metaGroupCache.groupField = groupField;
                //改了这里，目前仍然存在一个bug，暂时就这样
                var recordValue = items[0] ? items[0] : record;
                metaGroupCache.name = metaGroupCache.renderedGroupValue = hasRenderer ?
                    group.getAt(0) ? column.renderer(group.getAt(0).get(groupField), {}, recordValue) : column.renderer(groupName, {}, recordValue) : groupName;
                metaGroupCache.groupValue = items[0] ? items[0].get(groupField) : metaGroupCache.name;
                metaGroupCache.columnName = header ? header.text : groupField;
                rowValues.collapsibleCls = me.collapsible ? me.collapsibleCls : me.hdNotCollapsibleCls;
                //改了这里，目前仍然存在一个bug，暂时就这样
                if (Ext.isEmpty(items) == false) {
                    metaGroupCache.rows = metaGroupCache.children = items;
                } else {
                    metaGroupCache.rows = metaGroupCache.children;
                }
                if (me.showSummaryRow) {
                    rowValues.summaryRecord = data.summaryData[groupName];
                }
                return;
            }
            groupName = grouper.getGroupString(record);

            // If caused by an update event on the first or last records of a group fired by a GroupStore, the record's group will be attached.
            if (group) {
                items = group.items;
                rowValues.isFirstRow = record === items[0];
                rowValues.isLastRow = record === items[items.length - 1];
            }

            else {
                // See if the current record is the last in the group
                rowValues.isFirstRow = recordIndex === 0;
                if (!rowValues.isFirstRow) {
                    prev = store.getAt(recordIndex - 1);
                    // If the previous row is of a different group, then we're at the first for a new group
                    if (prev) {
                        // Must use Model's comparison because Date objects are never equal
                        rowValues.isFirstRow = !prev.isEqual(grouper.getGroupString(prev), groupName);
                    }
                }

                // See if the current record is the last in the group
                rowValues.isLastRow = recordIndex === (isBufferedStore ? store.getTotalCount() : store.getCount()) - 1;
                if (!rowValues.isLastRow) {
                    next = store.getAt(recordIndex + 1);
                    if (next) {
                        // Must use Model's comparison because Date objects are never equal
                        rowValues.isLastRow = !next.isEqual(grouper.getGroupString(next), groupName);
                    }
                }
            }

            if (rowValues.isFirstRow) {
                metaGroupCache.groupField = groupField;
                metaGroupCache.name = metaGroupCache.renderedGroupValue = hasRenderer ? column.renderer(record.get(groupField), {}, record) : groupName;
                metaGroupCache.groupValue = column.groupFn ? column.groupFn(record) : record.get(groupField); // 如果有groupFn应该取这个
                metaGroupCache.columnName = header ? header.text : groupField;
                rowValues.collapsibleCls = me.collapsible ? me.collapsibleCls : me.hdNotCollapsibleCls;
                rowValues.groupName = groupName;

                if (!me.isExpanded(groupName)) {
                    rowValues.itemClasses.push(me.hdCollapsedCls);
                    rowValues.isCollapsedGroup = true;
                }

                // We only get passed a GroupStore if the store is not buffered.
                if (isBufferedStore) {
                    metaGroupCache.rows = metaGroupCache.children = [];
                } else {
                    metaGroupCache.rows = metaGroupCache.children = me.getRecordGroup(record).items;
                }

                rowValues.metaGroupCache = metaGroupCache;
            }

            if (rowValues.isLastRow) {
                // Add the group's summary record to the last record in the group
                if (me.showSummaryRow) {
                    rowValues.summaryRecord = data.summaryData[groupName];
                    rowValues.itemClasses.push(Ext.baseCSSPrefix + 'grid-group-last');
                }
            }
            rowValues.needsWrap = (rowValues.isFirstRow || rowValues.summaryRecord);
        }
    }
});