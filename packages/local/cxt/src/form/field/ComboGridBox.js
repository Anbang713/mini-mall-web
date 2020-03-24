/**
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cxt.form.field.ComboGridBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'combogrid',

    requires: [
        'Ext.grid.Panel',
        'Ext.toolbar.Paging'
    ],

    /**
     * @cfg {Object} grid
     * 使用者需要设置grid的列与工具栏
     */
    grid: undefined,

    /**
     * CellEditor 识别字段。
     * 标记为true时，CellEditor在自身keyDown事件中，会先调用该控件的onKeyDown方法。
     */
    selfKeyDown: true,

    initComponent: function () {
        var me = this;
        if (!me.grid) {
            console.error('grid未设置');
        } else if (me.grid.width) {
            me.matchFieldWidth = false;
        }

        me.callParent();
    },

    afterRender: function () {
        var me = this;

        me.callParent();
        me.getStore().on('load', function () {
            me.doAutoSelect();
        });
    },

    onBindStore: function () {
        var me = this;
        me.callParent(arguments);
        Ext.apply(me.pickerSelectionModel, {
            changeConfirm: false,// 自行处理
            changeConfirmText: me.changeConfirmText
        });
    },

    onKeyDown: function (e) {
        if (e.isStopped)
            return;

        var me = this,
            key = e.getKey(),
            table = me.getPicker().getView(),
            navigationModel = table.getNavigationModel(),
            position = navigationModel.getPosition();
        if (!position)  //每次keydown都应该是isstop = false
            return me.callParent(arguments);

        if (key === e.LEFT) {
            position = table.walkCells(position, 'left');
            e.stopEvent();
        } else if (key === e.RIGHT) {
            position = table.walkCells(position, 'right');
            e.stopEvent();
        } else if (key === e.UP) {
            position = table.walkCells(position, 'up');
            e.stopEvent();
        } else if (key === e.DOWN) {
            position = table.walkCells(position, 'down');
            e.stopEvent();
        } else if (key === e.HOME) {
            position.setPosition(0, 0);
            e.stopEvent();
        } else if (key === e.ENTER) {
            if (me.isExpanded) {// 展开时，选择当前行
                me.rowSelect(position.record);
                e.stopEvent();
            } else {// 未展开时，直接返回
                return;
            }
        } else if (key === e.END) {
            position.setPosition(me.getStore().getData().length - 1, 0);
            e.stopEvent();
        } else if (key === e.PAGE_UP) {
            if (me.getStore().currentPage > 1) {
                me.getStore().previousPage();
            }
            e.stopEvent();
        } else if (key === e.PAGE_DOWN) {
            if (me.getStore().currentPage < Math.ceil(me.getStore().getTotalCount() / me.getStore().getPageSize())) {
                me.getStore().nextPage();
            }
            e.stopEvent();
        }
        else if (key === e.BACKSPACE) {
            if (me.clearable) {
                me.cancelSelect();// 退格键就删除
            }
        }
        /* else {
         return me.callParent(arguments);
         }*/

        if (Ext.isEmpty(position) || Ext.isEmpty(position.column)) {
            return
        }
        navigationModel.setPosition(position);
        me.getPicker().getSelectionModel().selectByPosition(navigationModel.getPosition());
    },

    onExpand: function () {
        var me = this;
        me.callParent(arguments);
        me.focus();
    },

    createPicker: function () {
        var me = this;

        var picker = Ext.create('Ext.grid.Panel', Ext.apply({
            store: me.store,
            floating: true,
            focusOnToFront: false,
            viewConfig: {
                focusOwner: me
            },
            selModel: {
                selType: 'rowmodel',
                mode: me.multiSelect ? 'SIMPLE' : 'SINGLE'
            },
            dockedItems: me.store.pageSize == 0 ? undefined : [{
                xtype: 'pagingtoolbar',
                itemId: 'pagingtoolbar',
                store: me.store,
                dock: 'bottom',
                displayInfo: true
            }],
            onMouseDown: function (e) {
                e.preventDefault(); // 不设置的话，作为下拉框会异常的收回去
            },
            listeners: {
                rowclick: function (grid, record) {
                    me.rowSelect(record);
                }
            }
        }, me.grid));

        me.picker = picker;
        return picker;
    },

    /**
     * @private
     * If the autoSelect config is true, and the picker is open, highlights the first item.
     */
    doAutoSelect: function () {
        var me = this;
        me.callParent(arguments);
        me._isSelectionUpdating = true;
        me.getPicker().getSelectionModel().selectByPosition(me.getPicker().getNavigationModel().getPosition());
        me._isSelectionUpdating = false;
    },

    /**
     * 表格数据选择
     * @param record
     */
    rowSelect: function (record) {
        var me = this,
            originalValue = me.getValueRecord(),
            changeConfirm = me.changeConfirm,
            changeConfirmText = me.changeConfirmText;

        if (Ext.isFunction(changeConfirm)) {
            changeConfirm = changeConfirm();
        }
        if (!originalValue || originalValue.get(me.valueField) == record.get(me.valueField))
            changeConfirm = false;

        if (!changeConfirm) {
            return me.doRowSelect(record);
        }
        Ext.Msg.confirm("提示", changeConfirmText, function (success) {
            if (success == 'yes') {
                me.doRowSelect(record);
            }
        });
    },

    doRowSelect: function (record) {
        var me = this;
        me.select(record, true);
        me.collapse();
        me.validate();
        me.fireEvent('select', me, record);// 发出选中事件
    }
});