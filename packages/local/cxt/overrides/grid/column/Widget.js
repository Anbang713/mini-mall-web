/**
 * Created by cRazy on 2017/1/18.
 */
Ext.define('overrides.grid.column.Widget', {
    override: 'Ext.grid.column.Widget',

    /**
     * 为了调整onWidgetAttach，增加rowIdx
     */
    privates: {
        getCachedStyle: function(el, style) {
            var cachedStyles = this.cachedStyles;
            return cachedStyles[style] || (cachedStyles[style] = Ext.fly(el).getStyle(style));
        },

        getFreeWidget: function() {
            var me = this,
                result = me.freeWidgetStack ? me.freeWidgetStack.pop() : null;

            if (!result) {
                result = Ext.widget(me.widget);

                result.resolveListenerScope = me.listenerScopeFn;
                result.getWidgetRecord = me.widgetRecordDecorator;
                result.getWidgetColumn = me.widgetColumnDecorator;
                result.dataIndex = me.dataIndex;
                result.measurer = me;
                result.ownerCmp = me.getView();
                // The ownerCmp of the widget is the encapsulating view, which means it will be considered
                // as a layout child, but it isn't really, we always need the layout on the
                // component to run if asked.
                result.isLayoutChild = me.returnFalse;
            }
            return result;
        },

        onBeforeRefresh: function () {
            var liveWidgets = this.liveWidgets,
                id;

            // Because of a memory leak bug in IE 8, we need to handle the dom node here before
            // it is destroyed.
            // See EXTJS-14874.
            for (id in liveWidgets) {
                liveWidgets[id].detachFromBody();
            }
        },

        onItemAdd: function(records, index, items) {
            var me = this,
                view = me.getView(),
                hasAttach = !!me.onWidgetAttach,
                dataIndex = me.dataIndex,
                isFixedSize = me.isFixedSize,
                len = records.length, i,
                record,
                row,
                cell,
                widget,
                el,
                focusEl,
                width;

            // Loop through all records added, ensuring that our corresponding cell in each item
            // has a Widget of the correct type in it, and is updated with the correct value from the record.
            if (me.isVisible(true)) {
                for (i = 0; i < len; i++) {
                    record = records[i];
                    if (record.isNonData) {
                        continue;
                    }

                    row = view.getRowFromItem(items[i]);

                    // May be a placeholder with no data row
                    if (row) {
                        cell = row.cells[me.getVisibleIndex()].firstChild;
                        if (!isFixedSize && !width) {
                            width = me.lastBox.width - parseInt(me.getCachedStyle(cell, 'padding-left'), 10) - parseInt(me.getCachedStyle(cell, 'padding-right'), 10);
                        }

                        widget = me.liveWidgets[record.internalId] = me.getFreeWidget();
                        widget.$widgetColumn = me;
                        widget.$widgetRecord = record;

                        // Render/move a widget into the new row
                        Ext.fly(cell).empty();

                        // Call the appropriate setter with this column's data field
                        if (widget.defaultBindProperty && dataIndex) {
                            widget.setConfig(widget.defaultBindProperty, record.get(dataIndex));
                        }

                        if (hasAttach) {
                            Ext.callback(me.onWidgetAttach, me.scope, [me, widget, record, i, records], 0, me);
                        }

                        el = widget.el || widget.element;
                        if (el) {
                            cell.appendChild(el.dom);
                            if (!isFixedSize) {
                                widget.setWidth(width);
                            }
                            widget.reattachToBody();
                        } else {
                            if (!isFixedSize) {
                                widget.width = width;
                            }
                            widget.render(cell);
                        }

                        // If the widget has a focusEl, ensure that its tabbability status is synched with the view's
                        // navigable/actionable state.
                        focusEl = widget.getFocusEl();
                        if (focusEl) {
                            if (view.actionableMode) {
                                if (!focusEl.isTabbable()) {
                                    focusEl.restoreTabbableState();
                                }
                            } else {
                                if (focusEl.isTabbable()) {
                                    focusEl.saveTabbableState();
                                }
                            }
                        }
                    }
                }
            }
        },

        onItemRemove: function(records, index, items) {
            var me = this,
                liveWidgets = me.liveWidgets,
                widget, item, id, len, i, focusEl;

            if (me.rendered) {

                // Single item or Array.
                items = Ext.Array.from(items);
                len = items.length;

                for (i = 0; i < len; i++) {
                    item = items[i];

                    // If there was a record ID (collapsed placeholder will no longer be
                    // accessible)... return ousted widget to free stack, and move its element
                    // to the detached body
                    id = item.getAttribute('data-recordId');
                    if (id && (widget = liveWidgets[id])) {
                        delete liveWidgets[id];
                        me.freeWidgetStack.unshift(widget);
                        widget.$widgetRecord = widget.$widgetColumn = null;

                        // Focusables in a grid must not be tabbable by default when they get put back in.
                        focusEl = widget.getFocusEl();
                        if (focusEl) {
                            if (focusEl.isTabbable()) {
                                focusEl.saveTabbableState();
                            }

                            // Some browsers do not deliver a focus change upon DOM removal.
                            // Force the issue here.
                            focusEl.blur();
                        }

                        widget.detachFromBody();
                    }
                }
            }
        },

        onItemUpdate: function(record, recordIndex, oldItemDom) {
            this.updateWidget(record);
        },

        onViewRefresh: function(view, records) {
            var me = this,
                rows = view.all,
                hasAttach = !!me.onWidgetAttach,
                oldWidgetMap = me.liveWidgets,
                dataIndex = me.dataIndex,
                isFixedSize = me.isFixedSize,
                cell, widget, el, width, recordId,
                itemIndex, recordIndex, record, id, lastBox, dom;

            if (me.isVisible(true)) {
                me.liveWidgets = {};
                Ext.suspendLayouts();
                for (itemIndex = rows.startIndex, recordIndex = 0; itemIndex <= rows.endIndex; itemIndex++, recordIndex++) {
                    record = records[recordIndex];
                    if (record.isNonData) {
                        continue;
                    }

                    recordId = record.internalId;
                    cell = view.getRow(rows.item(itemIndex)).cells[me.getVisibleIndex()].firstChild;

                    // Attempt to reuse the existing widget for this record.
                    widget = me.liveWidgets[recordId] = oldWidgetMap[recordId] || me.getFreeWidget();
                    widget.$widgetRecord = record;
                    widget.$widgetColumn = me;
                    delete oldWidgetMap[recordId];

                    lastBox = me.lastBox;
                    if (lastBox && !isFixedSize && width === undefined) {
                        width = lastBox.width - parseInt(me.getCachedStyle(cell, 'padding-left'), 10) - parseInt(me.getCachedStyle(cell, 'padding-right'), 10);
                    }

                    // Call the appropriate setter with this column's data field
                    if (widget.defaultBindProperty && dataIndex) {
                        widget.setConfig(widget.defaultBindProperty, records[recordIndex].get(dataIndex));
                    }
                    if (hasAttach) {
                        Ext.callback(me.onWidgetAttach, me.scope, [me, widget, record, recordIndex, records], 0, me);
                    }

                    el = widget.el || widget.element;
                    if (el) {
                        dom = el.dom;
                        if (dom.parentNode !== cell) {
                            Ext.fly(cell).empty();
                            cell.appendChild(el.dom);
                        }
                        if (!isFixedSize) {
                            widget.setWidth(width);
                        }
                        widget.reattachToBody();
                    } else {
                        if (!isFixedSize) {
                            widget.width = width;
                        }
                        Ext.fly(cell).empty();
                        widget.render(cell);
                    }
                }

                Ext.resumeLayouts(true);

                // Free any unused widgets from the old live map.
                // Move them into detachedBody.
                for (id in oldWidgetMap) {
                    widget = oldWidgetMap[id];
                    widget.$widgetRecord = widget.$widgetColumn = null;
                    me.freeWidgetStack.unshift(widget);
                    widget.detachFromBody();
                }
            }
        },

        returnFalse: function() {
            return false;
        },

        setupViewListeners: function(view) {
            var me = this;

            me.viewListeners = view.on({
                refresh: me.onViewRefresh,
                itemupdate: me.onItemUpdate,
                itemadd: me.onItemAdd,
                itemremove: me.onItemRemove,
                scope: me,
                destroyable: true
            });

            if (Ext.isIE8) {
                view.on('beforerefresh', me.onBeforeRefresh, me);
            }
        },

        updateWidget: function(record) {
            var dataIndex = this.dataIndex,
                widget;

            if (this.rendered) {
                widget = this.liveWidgets[record.internalId];
                // Call the appropriate setter with this column's data field
                if (widget && widget.defaultBindProperty && dataIndex) {
                    widget.setConfig(widget.defaultBindProperty, record.get(dataIndex));
                }
            }
        },

        widgetRecordDecorator: function() {
            return this.$widgetRecord;
        },

        widgetColumnDecorator: function() {
            return this.$widgetColumn;
        }
    }

});