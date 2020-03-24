/**
 * Created by cRazy on 2016/10/17.
 */
Ext.define('overrides.view.Table', {
    override: 'Ext.view.Table',

    requires: [
        'Ext.data.Model',
        'Ext.dom.Fly',
        'Ext.util.DelayedTask'
    ],

    /**
     * @cfg {Boolean} enableTextSelection
     * True to enable text selections.
     */
    enableTextSelection: true,

    handleUpdate: function (store, record, operation, changedFieldNames) {
        operation = operation || Ext.data.Model.EDIT;
        var me = this,
            recordIndex = me.store.indexOf(record),
            rowTpl = me.rowTpl,
            markDirty = me.markDirty,
            dirtyCls = me.dirtyCls,
            clearDirty = operation !== Ext.data.Model.EDIT,
            columnsToUpdate = [],
            hasVariableRowHeight = me.variableRowHeight,
            updateTypeFlags = 0,
            ownerCt = me.ownerCt,
            cellFly = me.cellFly || (me.self.prototype.cellFly = new Ext.dom.Fly()),
            oldItemDom, oldDataRow, newItemDom, newAttrs, attLen, attName, attrIndex, overItemCls, columns, column, len, i, cellUpdateFlag, cell, fieldName, value, defaultRenderer, scope, elData, emptyValue;
        if (me.viewReady) {
            // Table row being updated
            oldItemDom = me.getNodeByRecord(record);
            // Row might not be rendered due to buffered rendering or being part of a collapsed group...
            if (oldItemDom) {
                overItemCls = me.overItemCls;
                columns = me.ownerCt.getVisibleColumnManager().getColumns();
                // Collect an array of the columns which must be updated.
                // If the field at this column index was changed, or column has a custom renderer
                // (which means value could rely on any other changed field) we include the column.
                for (i = 0 , len = columns.length; i < len; i++) {
                    column = columns[i];
                    // We are not going to update the cell, but we still need to mark it as dirty.
                    if (column.preventUpdate) {
                        cell = Ext.fly(oldItemDom).down(column.getCellSelector(), true);
                        // Mark the field's dirty status if we are configured to do so (defaults to true)
                        if (!clearDirty && markDirty) {
                            cellFly.attach(cell);
                            if (record.isModified(column.dataIndex)) {
                                cellFly.addCls(dirtyCls);
                            } else {
                                cellFly.removeCls(dirtyCls);
                            }
                        }
                    } else {
                        // 0 = Column doesn't need update.
                        // 1 = Column needs update, and renderer has > 1 argument; We need to render a whole new HTML item.
                        // 2 = Column needs update, but renderer has 1 argument or column uses an updater.
                        cellUpdateFlag = me.shouldUpdateCell(record, column, changedFieldNames);
                        if (cellUpdateFlag) {
                            // Track if any of the updating columns yields a flag with the 1 bit set.
                            // This means that there is a custom renderer involved and a new TableView item
                            // will need rendering.
                            updateTypeFlags = updateTypeFlags | cellUpdateFlag;
                            // jshint ignore:line
                            columnsToUpdate[columnsToUpdate.length] = column;
                            hasVariableRowHeight = hasVariableRowHeight || column.variableRowHeight;
                        }
                    }
                }
                // Give CellEditors or other transient in-cell items a chance to get out of the way
                // if there are in the cells destined for update.
                me.fireEvent('beforeitemupdate', record, recordIndex, oldItemDom, columnsToUpdate);
                // If there's no data row (some other rowTpl has been used; eg group header)
                // or we have a getRowClass
                // or one or more columns has a custom renderer
                // or there's more than one <TR>, we must use the full render pathway to create a whole new TableView item
                if (me.getRowClass || !me.getRowFromItem(oldItemDom) || (updateTypeFlags & 1) || // jshint ignore:line
                    0) {
                    // (oldItemDom.tBodies[0].childNodes.length > 1 )) {// 这个判断好像有问题，不知道干什么的，但是进去就会报错
                    elData = oldItemDom._extData;
                    newItemDom = me.createRowElement(record, me.indexOfRow(record), columnsToUpdate);
                    if (Ext.fly(oldItemDom, '_internal').hasCls(overItemCls)) {
                        Ext.fly(newItemDom).addCls(overItemCls);
                    }
                    // Copy new row attributes across. Use IE-specific method if possible.
                    // In IE10, there is a problem where the className will not get updated
                    // in the view, even though the className on the dom element is correct.
                    // See EXTJSIV-9462
                    if (Ext.isIE9m && oldItemDom.mergeAttributes) {
                        oldItemDom.mergeAttributes(newItemDom, true);
                    } else {
                        newAttrs = newItemDom.attributes;
                        attLen = newAttrs.length;
                        for (attrIndex = 0; attrIndex < attLen; attrIndex++) {
                            attName = newAttrs[attrIndex].name;
                            if (attName !== 'id') {
                                oldItemDom.setAttribute(attName, newAttrs[attrIndex].value);
                            }
                        }
                    }
                    // The element's data is no longer synchronized. We just overwrite it in the DOM
                    if (elData) {
                        elData.isSynchronized = false;
                    }
                    // If we have columns which may *need* updating (think locked side of lockable grid with all columns unlocked)
                    // and the changed record is within our view, then update the view.
                    if (columns.length && (oldDataRow = me.getRow(oldItemDom))) {
                        me.updateColumns(oldDataRow, Ext.fly(newItemDom).down(me.rowSelector, true), columnsToUpdate);
                    }
                    // Loop thru all of rowTpls asking them to sync the content they are responsible for if any.
                    while (rowTpl) {
                        if (rowTpl.syncContent) {
                            // *IF* we are selectively updating columns (have been passed changedFieldNames), then pass the column set, else
                            // pass null, and it will sync all content.
                            if (rowTpl.syncContent(oldItemDom, newItemDom, changedFieldNames ? columnsToUpdate : null) === false) {
                                break;
                            }
                        }
                        rowTpl = rowTpl.nextTpl;
                    }
                } else // No custom renderers found in columns to be updated, we can simply update the existing cells.
                {
                    // Loop through columns which need updating.
                    for (i = 0 , len = columnsToUpdate.length; i < len; i++) {
                        column = columnsToUpdate[i];
                        // The dataIndex of the column is the field name
                        fieldName = column.dataIndex;
                        value = record.get(fieldName);
                        cell = Ext.fly(oldItemDom).down(column.getCellSelector(), true);
                        cellFly.attach(cell);
                        // Mark the field's dirty status if we are configured to do so (defaults to true)
                        if (!clearDirty && markDirty) {
                            if (record.isModified(column.dataIndex)) {
                                cellFly.addCls(dirtyCls);
                            } else {
                                cellFly.removeCls(dirtyCls);
                            }
                        }
                        defaultRenderer = column.usingDefaultRenderer;
                        scope = defaultRenderer ? column : column.scope;
                        // Call the column updater which gets passed the TD element
                        if (column.updater) {
                            Ext.callback(column.updater, scope, [
                                cell,
                                value,
                                record,
                                me,
                                me.dataSource
                            ], 0, column, ownerCt);
                        } else {
                            if (column.renderer) {
                                value = Ext.callback(column.renderer, scope, [
                                    value,
                                    null,
                                    record,
                                    0,
                                    0,
                                    me.dataSource,
                                    me
                                ], 0, column, ownerCt);
                            }

                            // MARK: 增加比较的渲染处理。
                            if (column.compare && column.compareRenderer && column.compareRenderer.call) {
                                var compareValue = Ext.callback(column.compareRenderer, scope, [
                                    value,
                                    null,
                                    record,
                                    0,
                                    0,
                                    me.dataSource,
                                    me
                                ], 0, column, ownerCt);
                                if (Ext.valueFrom(compareValue, '') != Ext.valueFrom(value, '')) {
                                    value = '<span style="display: inline-block;vertical-align: top;">' + ((value == null || value === '') ? column.emptyCellText : value) + '</span>';
                                    value += ' <span style="color: #BBBBBB;display: inline-block;vertical-align: top;">( ' + Ext.valueFrom(compareValue, '-') + ' ) </span>';
                                }
                            }

                            emptyValue = value == null || value === '';
                            value = emptyValue ? column.emptyCellText : value;
                            // Update the value of the cell's inner in the best way.
                            // We only use innerHTML of the cell's inner DIV if the renderer produces HTML
                            // Otherwise we change the value of the single text node within the inner DIV
                            // The emptyValue may be HTML, typically defaults to &#160;
                            if (column.producesHTML || emptyValue) {
                                cellFly.down(me.innerSelector, true).innerHTML = value;
                            } else {
                                cellFly.down(me.innerSelector, true).childNodes[0].data = value;
                            }
                        }
                        // Add the highlight class if there is one
                        if (me.highlightClass) {
                            Ext.fly(cell).addCls(me.highlightClass);
                            // Start up a DelayedTask which will purge the changedCells stack, removing the highlight class
                            // after the expiration time
                            if (!me.changedCells) {
                                me.self.prototype.changedCells = [];
                                me.prototype.clearChangedTask = new Ext.util.DelayedTask(me.clearChangedCells, me.prototype);
                                me.clearChangedTask.delay(me.unhighlightDelay);
                            }
                            // Post a changed cell to the stack along with expiration time
                            me.changedCells.push({
                                cell: cell,
                                cls: me.highlightClass,
                                expires: Ext.Date.now() + 1000
                            });
                        }
                    }
                }
                // If we have a commit or a reject, some fields may no longer be dirty but may
                // not appear in the modified field names. Remove all the dirty class here to be sure.
                if (clearDirty && markDirty && !record.dirty) {
                    Ext.fly(oldItemDom, '_internal').select('.' + dirtyCls).removeCls(dirtyCls);
                }
                // Coalesce any layouts which happen due to any itemupdate handlers (eg Widget columns) with the final refreshSize layout.
                if (hasVariableRowHeight) {
                    Ext.suspendLayouts();
                }
                // Since we don't actually replace the row, we need to fire the event with the old row
                // because it's the thing that is still in the DOM
                me.fireEvent('itemupdate', record, recordIndex, oldItemDom);
                // We only need to update the layout if any of the columns can change the row height.
                if (hasVariableRowHeight) {
                    if (me.bufferedRenderer) {
                        me.bufferedRenderer.refreshSize();
                        // Must climb to ownerGrid in case we've only updated one field in one side of a lockable assembly.
                        // ownerGrid is always the topmost GridPanel.
                        me.ownerGrid.updateLayout();
                    } else {
                        me.refreshSize();
                    }
                    // Ensure any layouts queued by itemupdate handlers and/or the refreshSize call are executed.
                    Ext.resumeLayouts(true);
                }
            }
        }
    },

    /**
     * @private
     * Emits the HTML representing a single grid cell into the passed output stream (which is an array of strings).
     *
     * @param {Ext.grid.column.Column} column The column definition for which to render a cell.
     * @param {Number} recordIndex The row index (zero based within the {@link #store}) for which to render the cell.
     * @param {Number} rowIndex The row index (zero based within this view for which to render the cell.
     * @param {Number} columnIndex The column index (zero based) for which to render the cell.
     * @param {String[]} out The output stream into which the HTML strings are appended.
     */
    renderCell: function (column, record, recordIndex, rowIndex, columnIndex, out) {
        var me = this,
            fullIndex,
            selModel = me.selectionModel,
            cellValues = me.cellValues,
            classes = cellValues.classes,
            fieldValue = record.data[column.dataIndex],
            cellTpl = me.cellTpl,
            value, clsInsertPoint,
            lastFocused = me.navigationModel.getPosition();
        cellValues.record = record;
        cellValues.column = column;
        cellValues.recordIndex = recordIndex;
        cellValues.rowIndex = rowIndex;
        cellValues.columnIndex = cellValues.cellIndex = columnIndex;
        cellValues.align = column.align;
        cellValues.innerCls = column.innerCls;
        cellValues.tdCls = cellValues.tdStyle = cellValues.tdAttr = cellValues.style = "";
        cellValues.unselectableAttr = me.enableTextSelection ? '' : 'unselectable="on"';
        // Begin setup of classes to add to cell
        classes[1] = column.getCellId();
        // On IE8, array[len] = 'foo' is twice as fast as array.push('foo')
        // So keep an insertion point and use assignment to help IE!
        clsInsertPoint = 2;
        if (column.renderer && column.renderer.call) {
            fullIndex = me.ownerCt.columnManager.getHeaderIndex(column);
            value = column.renderer.call(column.usingDefaultRenderer ? column : column.scope || me.ownerCt, fieldValue, cellValues, record, recordIndex, fullIndex, me.dataSource, me);
            if (cellValues.css) {
                // This warning attribute is used by the compat layer
                // TODO: remove when compat layer becomes deprecated
                record.cssWarning = true;
                cellValues.tdCls += ' ' + cellValues.css;
                cellValues.css = null;
            }
            // Add any tdCls which was added to the cellValues by the renderer.
            if (cellValues.tdCls) {
                classes[clsInsertPoint++] = cellValues.tdCls;
            }
        } else {
            value = fieldValue;
        }
        // MARK: 增加比较的渲染处理。
        if (column.compare && column.compareRenderer && column.compareRenderer.call) {
            fullIndex = me.ownerCt.columnManager.getHeaderIndex(column);
            var compareValue = column.compareRenderer.call(column.usingDefaultRenderer ? column : column.scope || me.ownerCt, fieldValue, cellValues, record, recordIndex, fullIndex, me.dataSource, me);
            if (Ext.valueFrom(compareValue, '') != Ext.valueFrom(value, '')) {
                value = '<span style="display: inline-block;vertical-align: top;">' + ((value == null || value === '') ? column.emptyCellText : value) + '</span>';
                value += ' <span style="color: #BBBBBB;display: inline-block;vertical-align: top;">( ' + Ext.valueFrom(compareValue, '-') + ' ) </span>';
            }
        }

        cellValues.value = (value == null || value === '') ? column.emptyCellText : value;
        if (column.tdCls) {
            classes[clsInsertPoint++] = column.tdCls;
        }
        if (me.markDirty && record.dirty && record.isModified(column.dataIndex)) {
            classes[clsInsertPoint++] = me.dirtyCls;
        }
        if (column.isFirstVisible) {
            classes[clsInsertPoint++] = me.firstCls;
        }
        if (column.isLastVisible) {
            classes[clsInsertPoint++] = me.lastCls;
        }
        if (!me.enableTextSelection) {
            classes[clsInsertPoint++] = me.unselectableCls;
        }
        if (selModel && (selModel.isCellModel || selModel.isSpreadsheetModel) && selModel.isCellSelected(me, recordIndex, column)) {
            classes[clsInsertPoint++] = me.selectedCellCls;
        }
        if (lastFocused && lastFocused.record.id === record.id && lastFocused.column === column) {
            classes[clsInsertPoint++] = me.focusedItemCls;
        }
        // Chop back array to only what we've set
        classes.length = clsInsertPoint;
        cellValues.tdCls = classes.join(' ');
        cellTpl.applyOut(cellValues, out);
        // Dereference objects since cellValues is a persistent var in the XTemplate's scope chain
        cellValues.column = cellValues.record = null;
    },

    /**
     * Try to focus this component.
     *
     * If this component is disabled, a close relation will be targeted for focus instead
     * to keep focus localized for keyboard users.
     * @param {Mixed} [selectText] If applicable, `true` to also select all the text in this component, or an array consisting of start and end (defaults to start) position of selection.
     * @param {Boolean/Number} [delay] Delay the focus this number of milliseconds (true for 10 milliseconds).
     * @param {Function} [callback] Only needed if the `delay` parameter is used. A function to call upon focus.
     * @param {Function} [scope] Only needed if the `delay` parameter is used. The scope (`this` reference) in which to execute the callback.
     * @return {Ext.Component} The focused Component. Usually `this` Component. Some Containers may
     * delegate focus to a descendant Component ({@link Ext.window.Window Window}s can do this through their
     * {@link Ext.window.Window#defaultFocus defaultFocus} config option. If this component is disabled, a closely
     * related component will be focused and that will be returned.
     */
    focus: function (selectText, delay, callback, scope) {
        var me = this,
            focusTarget, focusElDom, containerScrollTop;
        if ((!me.focusable && !me.isContainer) || me.destroyed || me.destroying) {
            return;
        }
        // If delay is wanted, queue a call to this function.
        if (delay) {
            me.getFocusTask().delay(Ext.isNumber(delay) ? delay : 10, me.focus, me, [
                selectText,
                false,
                callback,
                scope
            ]);
            return me;
        }
        // An immediate focus call must cancel any outstanding delayed focus calls.
        me.cancelFocus();
        // Assignment in conditional here to avoid calling getFocusEl()
        // if me.canFocus() returns false
        if (me.canFocus()) {
            if (focusTarget = me.getFocusEl()) {
                // getFocusEl might return a Component if a Container wishes to delegate focus to a
                // descendant via its defaultFocus configuration.
                if (focusTarget.isComponent) {
                    return focusTarget.focus(selectText, delay, callback, scope);
                }
                focusElDom = focusTarget.dom;
                // If it was an Element with a dom property
                if (focusElDom) {
                    if (me.floating) {
                        containerScrollTop = me.container.dom.scrollTop;
                    }
                    // Focus the element.
                    // The Ext.event.publisher.Focus publisher listens for global focus changes and
                    // The ComponentManager responds by invoking the onFocusEnter and onFocusLeave methods
                    // of the components involved.
                    focusTarget.focus();
                    if (selectText) {
                        if (Ext.isArray(selectText)) {
                            if (me.selectText) {
                                me.selectText.apply(me, selectText);
                            }
                        } else if (focusElDom.select) {
                            // This method both focuses and selects the element.
                            focusElDom.select();
                        } else if (me.selectText) {
                            me.selectText();
                        }
                    }
                    // Call the callback when focus is done
                    Ext.callback(callback, scope);
                }
                // Focusing a floating Component brings it to the front of its stack.
                // this is performed by its zIndexManager. Pass preventFocus true to avoid recursion.
                if (me.floating) {
                    if (containerScrollTop !== undefined) {
                        me.container.dom.scrollTop = containerScrollTop;
                    }
                }
            }
        } else {
            // If we are asked to focus while not able to focus though disablement/invisibility etc,
            // focus may revert to document.body if the current focus is being hidden or destroyed.
            // This must be avoided, both for the convenience of keyboard users, and also
            // for when focus is tracked within a tree, such as below an expanded ComboBox.
            focusTarget = me.findFocusTarget();
            if (focusTarget && this !== focusTarget.view) {// 会死循环？
                return focusTarget.focus(selectText, delay, callback, scope);
            }
        }
        return me;
    }
});