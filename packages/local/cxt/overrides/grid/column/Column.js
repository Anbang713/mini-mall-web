/**
 * Created by cRazy on 2016/9/21.
 */
Ext.define('overrides.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    config: {

        /**
         * @cfg {boolean} allowBlank
         * 是否允许为空，表格验证时使用
         */
        allowBlank: true
    },
    // 默认隐藏
    menuDisabled: true,

    menuDisabledCls: Ext.baseCSSPrefix + 'column-header-menuDisabled',

    /**
     * @cfg {boolean} editIsObject
     * SingleTagField定制属性。
     * 对于可编辑单元，编辑目标是object时进行标注。
     * 标注后，当单元格的编辑完成时，会自动读取valueData进行赋值
     */
    editIsObject: false,

    /**
     * @cfg {String} contentPath
     * 针对数据对象的路径。
     * Ext默认的record更新是到dataIndex的属性。但是对于record中封装对象的属性编辑时，就有所不便。
     * 设置contentPath后，当单元格编辑完成时，会根据contentPath 所指路径更新数据。
     * 如设置contentPath: 'usage.adjust', 编辑完成时，会将数据更新到record中usage对象的adjust字段上。
     */
    contentPath: undefined,

    setAllowBlank: function (allowBlank) {
        var me = this;
        me.allowBlank = allowBlank;
        if (me.rendered && me.allowBlank) {
            me.textEl.setHtml(me.text);
        } else if (me.rendered) {
            me.textEl.setHtml('<span role="presentation" class="x-column-header-text-inner"><span style="color: red"> * </span>' + me.text + '</span>');
        }
    },

    /**
     * Sets the header text for this Column.
     * @param {String} text The header to display on this Column.
     */
    setText: function (text) {
        var me = this;
        me.text = text;
        if (me.rendered && me.allowBlank) {
            me.textEl.setHtml('<span role="presentation" class="x-column-header-text-inner">' + text + '</span>');
        } else if (me.rendered) {
            me.textEl.setHtml('<span role="presentation" class="x-column-header-text-inner"><span style="color: red"> * </span>' + text + '</span>');
        }
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        if (!me.allowBlank) {
            me.textEl.setHtml('<span role="presentation" class="x-column-header-text-inner"><span style="color: red"> * </span>' + me.text + '</span>');
        }
        if (me.menuDisabled && !me.hasCls(me.menuDisabledCls)) {
            me.addCls(me.menuDisabledCls);
        }
    },

    getContextValue: function (value, column, record) {
        var me = this;
        if (!me.contentPath)
            return value;
        if (me.contentPath === '.')
            return record.getData();

        var params = me.contentPath.split('.'),
            o = record.get(params[0]);
        for (var i = 1; i < params.length; i++) {
            if (o)
                o = o[params[i]];
        }
        return o;
    },

    sort: function (direction) {
        var me = this,
            grid = me.up('tablepanel'),
            store = grid.store,
            field = me.getSortParam();
        if (grid.view.isGrouping === true) {// 分组后不允许再排序了！
            return;
        }
        // Maintain backward compatibility.
        // If the grid is NOT configured with multi column sorting, then specify "replace".
        // Only if we are doing multi column sorting do we insert it as one of a multi set.
        // Suspend layouts in case multiple views depend upon this grid's store (eg lockable assemblies)
        Ext.suspendLayouts();
        me.sorting = true;
        if (Ext.isFunction(field)) {
            field = {
                dataIndex: me.dataIndex,
                sorterFn: field,
                direction: direction
            }
        }
        store.sort(field, direction, grid.multiColumnSort ? 'multi' : 'replace');
        delete me.sorting;
        Ext.resumeLayouts(true);
    },

    /**
     * Returns the parameter to sort upon when sorting this header. By default this returns the dataIndex and will not
     * need to be overridden in most cases.
     */
    getSortParam: function () {
        var me = this,
            grid = me.ownerCt.grid,
            params;
        if (!me.sortParam || grid.getStore().getRemoteSort()) {
            return me.dataIndex;
        }
        params = me.sortParam.split('.');
        if (params.length == 0) {
            return me.dataIndex;
        }
        return function (record1, record2) {
            var compare = function (o1, o2) {
                if (o1 === o2) {
                    return 0;
                }
                if (o1 && (o2 == undefined || o2 == null))
                    return -1;
                else if ((o1 == undefined || o1 == null) && o2)
                    return 1;
                else if (o1 > o2 == o1 < o2)
                    return 0;
                return o1 > o2 ? 1 : -1;
            };

            var o1 = record1.get(params[0]),
                o2 = record2.get(params[0]),
                flag = compare(o1, o2);
            if (flag != 0) {
                return flag;
            }

            for (var i = 1; i < params.length; i++) {
                o1 = o1[params[i]];
                o2 = o2[params[i]];
                flag = compare(o1, o2);
                if (flag != 0) {
                    return flag;
                }
            }
            return 0;
        };
    }
});