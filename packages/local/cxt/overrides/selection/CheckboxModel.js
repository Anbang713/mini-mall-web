Ext.define('overrides.selection.CheckboxModel', {
    override: 'Ext.selection.CheckboxModel',

    privates: {
        onBeforeNavigate: function (metaEvent) {
            var e = metaEvent.keyEvent;
            if (this.selectionMode !== 'SINGLE') {
                metaEvent.ctrlKey = metaEvent.ctrlKey || e.ctrlKey || (e.type === 'click' && !e.shiftKey) || e.getKey() === e.SPACE;
            }
        },

        selectWithEventMulti: function (record, e, isSelected) {
            var me = this;

            if (!e.shiftKey && !e.ctrlKey) {
                if (isSelected) {
                    me.doDeselect(record);
                } else {
                    me.doSelect(record, true);
                }
            } else {
                me.callParent([record, e, isSelected]);
            }
        }
    },

    /**
     * Toggle between selecting all and deselecting all when clicking on
     * a checkbox header.
     */
    onHeaderClick: function (headerCt, header, e) {
        var me = this,
            isChecked;
        if (header === me.column && me.mode !== 'SINGLE' && me.showHeaderCheckbox !== false) {// 不显示头部checkbox那自然也不能触发事件
            e.stopEvent();
            isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
            if (isChecked) {
                me.deselectAll();
            } else {
                me.selectAll();
            }
        }
    },

    /**
     * Selects all records in the view.
     * @param {Boolean} suppressEvent True to suppress any select events
     */
    selectAll: function (suppressEvent) {
        var me = this,
            selections = me.store.getRange(),
            start = me.getSelection().length;

        me.suspendChanges();
        //禁止事件
        me.doSelect(selections, true, true);
        me.resumeChanges();
        // fire selection change only if the number of selections differs
        if (!suppressEvent && !me.destroyed) {
            me.maybeFireSelectionChange(me.getSelection().length !== start);
            me.fireEvent('select', me, selections);
        }
    },

    /**
     * Deselects all records in the view.
     * @param {Boolean} [suppressEvent] True to suppress any deselect events
     */
    deselectAll: function (suppressEvent) {
        var me = this,
            selections = me.getSelection(),
            selIndexes = {},
            store = me.store,
            start = selections.length,
            i, l, rec;

        // Cache selection records' indexes first to avoid
        // looking them up on every sort comparison below.
        // We can't rely on store.indexOf being fast because
        // for whatever reason the Store in question may force
        // sequential index lookup, which will result in O(n^2)
        // sort performance below.
        for (i = 0, l = selections.length; i < l; i++) {
            rec = selections[i];

            selIndexes[rec.id] = store.indexOf(rec);
        }

        // Sort the selections so that the events fire in
        // a predictable order like selectAll
        selections = Ext.Array.sort(selections, function (r1, r2) {
            var idx1 = selIndexes[r1.id],
                idx2 = selIndexes[r2.id];

            // Don't check for equality since indexes will be unique
            return idx1 < idx2 ? -1 : 1;
        });

        me.suspendChanges();
        //禁止事件
        me.doDeselectAll(selections, true);
        me.resumeChanges();
        // fire selection change only if the number of selections differs
        if (!suppressEvent && !me.destroyed) {
            me.maybeFireSelectionChange(me.getSelection().length !== start);
            me.fireEvent('deselect', me, selections);
        }
    },
    //取消全选
    doDeselectAll: function (records, suppressEvent) {
        var me = this,
            selected = me.selected,
            i = 0,
            len, record,
            attempted = 0,
            accepted = 0,
            commit;

        if (me.locked || !me.store) {
            return false;
        }

        if (typeof records === "number") {
            // No matching record, jump out
            record = me.store.getAt(records);
            if (!record) {
                return false;
            }
            records = [record];
        } else if (!Ext.isArray(records)) {
            records = [records];
        }

        commit = function () {
            ++accepted;
            if (record === me.selectionStart) {
                me.selectionStart = null;
            }
        };

        len = records.length;

        me.suspendChanges();
        //删除全部选中明细
        selected.removeAll();
        for (; i < len; i++) {
            record = records[i];
            if (me.lastSelected === record) {
                me.lastSelected = selected.last();
            }
            ++attempted;
            me.onSelectChange(record, false, suppressEvent, commit);
            if (me.destroyed) {
                return false;
            }
        }
        me.resumeChanges();

        // fire selchange if there was a change and there is no suppressEvent flag
        me.maybeFireSelectionChange(accepted > 0 && !suppressEvent);
        return accepted === attempted;
    }

});