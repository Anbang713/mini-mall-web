/**
 @private
 替换new Ext.grid.CellEditor()
 */
Ext.define('overrides.grid.plugin.CellEditing', {
    override: 'Ext.grid.plugin.CellEditing',

    requires: [
        'Ext.form.field.ComboBox',
        'Ext.grid.CellContext',
        'Ext.grid.CellEditor',
        'Ext.grid.CellEditor'
    ],

    /**
     * 取得编辑器
     * @param record
     * @param column
     * @returns {*}
     */
    getEditor: function (record, column) {
        var me = this,
            editors = me.editors,
            grid = me.grid.ownerGrid,
            editorId = column.getItemId(),
            editor = editors.getByKey(editorId);

        if (!editor) {
            editor = column.getEditor(record);
            if (!editor) {
                return false;
            }
            editor.setWidth(column.getWidth());//设置宽度
            if (column.allowBlank === false && Ext.isFunction(editor.setAllowBlank)) {
                editor.setAllowBlank(false);
            }

            // Allow them to specify a CellEditor in the Column
            if (editor instanceof Ext.grid.CellEditor) {
                editor.floating = true;
            }
            // But if it's just a Field, wrap it.
            else {
                var rawEditor = editor;
                editor = new Ext.grid.CellEditor({
                    floating: true,
                    editorId: editorId,
                    field: editor
                });
                if (Ext.isFunction(rawEditor.setCellEditor))
                    rawEditor.setCellEditor(editor);
            }

            // Add the Editor as a floating child of the grid
            // Prevent this field from being included in an Ext.form.Basic
            // collection, if the grid happens to be used inside a form
            editor.field.excludeForm = true;

            // If the editor is new to this grid, then add it to the grid, and ensure it tells us about its life cycle.
            if (editor.column !== column) {
                editor.column = column;
                editor.on({
                    scope: me,
                    complete: me.onEditComplete,
                    canceledit: me.cancelEdit
                });
                column.on('removed', me.onColumnRemoved, me);
            }
            editors.add(editor);
        }

        if (Ext.isFunction(column.validator)) {
            var fromCellEditing = true;
            var validator = function (val) {
                // if (!record.store) {// 好像record的store有的时候会丢。
                //     record.store = grid.getStore();
                // }
                return column.validator.call(column, val, grid.getStore().indexOf(record), record, grid, fromCellEditing);
            };

            if (editor instanceof Ext.grid.CellEditor) {
                editor.field.validator = validator;
            } else {
                editor.validator = validator;
            }
        }

        if (Ext.isFunction(editor.clearValue)) {
            editor.clearValue();
        } else if (editor.field && Ext.isFunction(editor.field.clearValue)) {
            editor.field.clearValue();
        }
        // Inject an upward link to its owning grid even though it is not an added child.
        editor.ownerCmp = me.grid.ownerGrid;

        if (column.isTreeColumn) {
            editor.isForTree = column.isTreeColumn;
            editor.addCls(Ext.baseCSSPrefix + 'tree-cell-editor');
        }
        if (editor.field) {
            editor.field.editRecord = record;
        }

        // Set the owning grid.
        // This needs to be kept up to date because in a Lockable assembly, an editor
        // needs to swap sides if the column is moved across.
        editor.setGrid(me.grid);

        // Keep upward pointer correct for each use - editors are shared between locking sides
        editor.editingPlugin = me;
        return editor;
    },

    onEditComplete: function (ed, value, startValue) {
        if (ed.editingPlugin.isSuspended())
            return;
        var me = this,
            contentValue = value,
            context = ed.context,
            column = context.column,
            view, record;

        view = context.view;
        record = context.record;
        context.value = value;
        if (column.extValue !== true && value === startValue) {
            return;
        }

        if (!me.validateEdit(context)) {
            me.editing = false;
            return;
        }
        if (ed.field instanceof Ext.form.field.ComboBox && column.editIsObject) {
            if (startValue === ed.field.getValueData() || startValue && ed.field.getValueData() && startValue['id'] === ed.field.getValueData()['id']) {
                return;
            }
            context.value = contentValue = ed.field.getValueData();
        }

        // Only update the record if the new value is different than the
        // startValue. When the view refreshes its el will gain focus
        if (context.isValid !== false && !record.isEqual(value, startValue)) {
            if (column.contentPath && column.contentPath != '.') {
                var path = column.contentPath.split('.'),
                    data = record.data;

                if (path.length > 1) {
                    if (!data[path[0]])
                        data[path[0]] = {};

                    for (var i = 0; i < path.length; i++) {
                        if (i == path.length - 1) {
                            data [path[i]] = value;
                        } else if (!data[path[i]]) {
                            data [path[i]] = {};
                        }
                        data = data[path[i]];
                    }
                }
            }

            record.set(context.column.dataIndex, contentValue);
            // Changing the record may impact the position
            context.rowIdx = view.indexOf(record);
        }

        context.isValid = me.fireEvent('edit', me, context);

        if (me.grid) {
            me.grid.view.actionPosition = undefined;
            if (me.grid.lockedGrid) {
                me.grid.lockedGrid.view.actionPosition = undefined;
            }
            if (me.grid.normalGrid) {
                me.grid.normalGrid.view.actionPosition = undefined;
            }
        }
        // We clear down our context here in response to the CellEditor completing.
        // We only do this if we have not already started editing a new context.
        if (me.context === context) {
            me.setActiveEditor(null);
            me.setActiveColumn(null);
            me.setActiveRecord(null);
            me.editing = false;
        }
    },

    /**
     * Starts editing by position (row/column)
     * @param {Object} position A position with keys of row and column.
     * Example usage:
     *
     *     cellEditing.startEditByPosition({
     *         row: 3,
     *         column: 2
     *     });
     */
    startEditByPosition: function (position) {
        var me = this,
            cm = me.grid.getColumnManager(),
            index,
            activeEditor = me.getActiveEditor();

        // If a raw {row:0, column:0} object passed.
        // The historic API is that column indices INCLUDE hidden columns, so use getColumnManager.
        if (!position.isCellContext) {
            position = new Ext.grid.CellContext(me.view).setPosition(position.row, me.grid.getVisibleColumnManager().getColumns()[position.column]);
        }
        if (!position.column) {//好像会出现空指针，未知的原因，直接返回吧。免得报错
            return;
        }

        // Coerce the edit column to the closest visible column. This typically
        // only needs to be done when called programatically, since the position
        // is handled by walkCells, which is called before this is invoked.
        index = cm.getHeaderIndex(position.column);
        position.column = cm.getVisibleHeaderClosestToIndex(index);

        // Already in actionable mode.
        if (me.grid.view.actionableMode) {

            // We are being asked to edit right where we are (click in an active editor will get here)
            if (me.editing && position.isEqual(me.context)) {
                return;
            }

            // Finish any current edit.
            if (activeEditor) {
                activeEditor.completeEdit();
            }

            // Get the editor for the position, and if there is one, focus it
            if (me.activateCell(position)) {
                // Ensure the row is activated.
                me.activateRow(me.view.all.item(position.rowIdx, true));

                activeEditor = me.getEditor(position.record, position.column);
                if (activeEditor) {
                    activeEditor.field.focus();
                }
            } else {
                return false;// 激活失败，返回false
            }
        }

        else {
            // Enter actionable mode at the requested position
            return me.grid.setActionableMode(true, position);
        }
    },


    /**
     * This method is called when actionable mode is requested for a cell.
     * @param {Ext.grid.CellContext} position The position at which actionable mode was requested.
     * @return {Boolean} `true` if this cell is actionable (editable)
     * @protected
     */
    activateCell: function (position) {
        var me = this,
            record = position.record,
            column = position.column,
            context,
            cell,
            editor;

        context = me.getEditingContext(record, column);
        if (!context) {
            return;
        }

        if (!me.preventBeforeCheck) {
            // Allow vetoing, or setting a new editor *before* we call getEditor
            if (!column.getEditor(record) || me.beforeEdit(context) === false || me.fireEvent('beforeedit', me, context) === false || context.cancel) {
                return;
            }
        }

        // Recapture the editor. The beforeedit listener is allowed to replace the field.
        editor = me.getEditor(record, column);

        if (editor) {
            cell = context.cell;

            // Ensure editor is there in the cell, but hidden.
            // It will show if it begins editing.
            // And will then be found in the tabbable children of the activating cell
            if (!editor.rendered) {
                editor.hidden = true;
                editor.render(cell, 0);
            } else {
                if (editor.container !== cell) {
                    editor.container = cell;
                    cell.insertBefore(editor.el.dom, cell.firstChild);
                }
                editor.hide();
            }

            me.setEditingContext(context);

            // Request that the editor start.
            // It may veto, and return with the editing flag false.
            editor.startEdit(cell, column.getContextValue(context.value, column, record), false);

            // Set contextual information if we began editing (can be vetoed by events)
            if (editor.editing) {
                me.setActiveEditor(editor);
                me.setActiveRecord(record);
                me.setActiveColumn(column);
                me.editing = true;
                me.scroll = position.view.el.getScroll();
            }

            // Return true if the cell is actionable according to us
            return editor.editing;
        }
    }
});