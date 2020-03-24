/**
 * Created by cRazy on 2016/9/23.
 */
Ext.define('overrides.grid.CellEditor', {
    override: 'Ext.grid.CellEditor',

    requires: [
        'Ext.container.Container',
        'Ext.form.field.Picker'
    ],


    /**
     * @inherited
     * @param remainVisible
     */
    completeEdit: function (remainVisible) {
        var me = this,
            field = me.field;

        if (!field || field.isDestroyed) {
            return;
        }

        me.callParent(arguments);
        if (Ext.isFunction(field.clearValue)) {// 清除控件的值，为下次设置准备
            field.clearValue();
        }
        if (Ext.isFunction(field.clearInvalid)) {// 清除掉错误的验证消息。
            field.clearInvalid();
        }
    },


    /**
     * @inherited
     * @param e
     */
    onFocusLeave: function (e) {
        var me = this,
            field = me.field;

        // 可能出现的空指针？
        if (!field || field.isDestroyed || !field.el.dom) {
            return;
        }
        me.callParent([e]);
    },

    /**
     * 表格单元格编辑器的按键事件。上下左右
     */
    onSpecialKey: function (field, event) {
        var me = this,
            key = event.getKey();

        if (field.selfKeyDown && Ext.isFunction(field.onKeyDown)) {
            field.onKeyDown(event);
        }
        if (event.isStopped) {
            return;
        }
        switch (key) {
            case event.TAB:
                me.onKeyTab(field, event);
                break;
            case event.ENTER:
                me.onKeyEnter(field, event);
                break;
            case event.RIGHT:
            case event.LEFT:
                me.onKeyLeftRight(field, event);
                break;
            case event.UP:
            case event.DOWN:
                me.onKeyUpDown(field, event);
                break;
            default:
                me.callParent(arguments);
        }
    },

    onKeyTab: function (field, event) {
        var me = this,
            up = me.grid.up();
        event.stopEvent();
        if (!!up && up instanceof Ext.container.Container) {
            return up.focusOnNext(me.grid);
        }
    },

    onKeyEnter: function (field, event) {
        var me = this,
            view = me.context.view,
            navigationModel = view.getNavigationModel(),
            grid = view.ownerGrid,
            newPosition, lastPosition;

        me.completeEdit(true);

        if (me.context.isValid === false)
            return;

        grid.setActionableMode(false);
        navigationModel.setPosition(me.context, null, event);
        newPosition = navigationModel.getPosition();
        if (!newPosition) {
            navigationModel.setPosition(me.context.rowIdx, me.context.colIdx, event);
            newPosition = navigationModel.getPosition();
        }

        while (true) {
            while (true) {
                lastPosition = newPosition;
                newPosition = view.walkCells(lastPosition, 'right');
                if (Ext.isEmpty(newPosition) || Ext.isEmpty(newPosition.column) || newPosition.column.getEditor()) {
                    break;
                }
            }

            // 本行右侧没有enterStop的可编辑单元. 加一行数据后找第一个enterStop的可编辑单元格
            if (!newPosition) {
                if (grid.autoAppend === false) {
                    return;
                }
                var appendRow = lastPosition.rowIdx + 1;
                var record = {};
                me.editingPlugin.fireEvent('appendrecord', me.editingPlugin, record);
                grid.getStore().getProxy().getData().push(record);
                grid.getStore().load();

                newPosition = lastPosition;
                newPosition.view = view;
                newPosition.setPosition(appendRow, 0);
                while ((Ext.isEmpty(newPosition) || Ext.isEmpty(newPosition.column) || newPosition.column.getEditor()) == false) {
                    lastPosition = newPosition;
                    newPosition = view.walkCells(lastPosition, 'right');
                }
            }

            navigationModel.setPosition(newPosition, null, event);
            if (!me.editingPlugin.startEditByPosition(newPosition) === false) {
                break;
            }
        }
    },

    onKeyLeftRight: function (field, event) {
        var me = this,
            dir = event.getKey() === event.RIGHT ? 'right' : 'left',
            view = me.context.view,
            navigationModel = view.getNavigationModel(),
            grid = view.ownerGrid,
            newPosition;

        if (field && field['stopEvents'] && Ext.Array.contains(field['stopEvents'], dir)) {
            return;
        }

        if (!me.isCaretOutOfBound(event.target, dir)) {
            return;
        }

        me.completeEdit(true);
        navigationModel.setPosition(me.context, null, event);
        grid.setActionableMode(false);

        newPosition = view.walkCells(navigationModel.getPosition(), dir);
        if (me.context.rowIdx !== newPosition.rowIdx) {
            return;
        }
        navigationModel.setPosition(newPosition, null, event);
        if (newPosition.column.getEditor()) {
            me.editingPlugin.startEditByPosition(newPosition);
        }
    },
    // datefield下键会弹出pickup
    onKeyUpDown: function (field, event) {
        var me = this,
            dir = event.getKey() === event.UP ? 'up' : 'down',
            view = me.context.view,
            navigationModel = view.getNavigationModel(),
            grid = view.ownerGrid,
            newPosition;

        if (field && field['stopEvents'] && Ext.Array.contains(field['stopEvents'], dir)) {
            return;
        }

        if (event.getKey() === event.DOWN && field instanceof Ext.form.field.Picker) {
            field.expand();
            if (Ext.isFunction(field.doQuery)) {
                field.doQuery('', true);
            }
            return;
        }

        me.completeEdit(true);
        navigationModel.setPosition(me.context, null, event);
        grid.setActionableMode(false);
        var position = navigationModel.getPosition(),
            lastPosition = Ext.apply({}, position);
        newPosition = view.walkCells(position, dir);
        if (!newPosition) {
            if (grid.autoAppend === false || dir == 'up') {
                return;
            }

            var record = {};
            me.editingPlugin.fireEvent('appendrecord', me.editingPlugin, record);
            grid.getStore().getProxy().getData().push(record);
            grid.getStore().load();
            newPosition = view.walkCells(lastPosition, dir);
        }
        navigationModel.setPosition(me.context, null, event);
        if (newPosition && newPosition.column && newPosition.column.getEditor()) {
            me.editingPlugin.startEditByPosition(newPosition);
        }
    },

    isCaretOutOfBound: function (el, dir) {
        if (el.type === 'button' || el.type === 'checkbox' || el.readOnly) return true;

        var caretPos;
        if (document.selection) { // IE
            var range = document.selection.createRange();
            range.moveStart("character", -el.value.length);
            caretPos = range.text.length;
        } else { // !IE
            caretPos = el.selectionStart;
        }
        return dir === 'right' ? (el.value.length === caretPos) : (0 === caretPos);
    }
});