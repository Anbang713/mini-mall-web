/**
 * Created by lzy on 2017/2/6.
 */
Ext.define('overrides.grid.column.Check', {
    override: 'Ext.grid.column.Check',

    readOnly: false,

    readOnlyCls: Ext.baseCSSPrefix + 'item-readonly',

    /**
     * @event checkchange
     * Fires when the checked state of a row changes
     * @param {Ext.ux.CheckColumn} this CheckColumn
     * @param {Object} record
     * @param {Boolean} checked True if the box is now checked
     */

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function (type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this;
        if (me.readOnly)
            return;

        var key = type === 'keydown' && e.getKey(),
            mousedown = type === 'mousedown',
            disabled = me.disabled,
            ret,
            checked;

        // Flag event to tell SelectionModel not to process it.
        e.stopSelection = !key && me.stopSelection;

        if (!disabled && (mousedown || (key === e.ENTER || key === e.SPACE))) {
            checked = !me.isRecordChecked(record);

            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked) !== false) {
                me.setRecordCheck(record, checked, cell, row, e);
                me.fireEvent('checkchange', me, recordIndex, checked, record);// 修改传出的recordIndex 为 record

                // Do not allow focus to follow from this mousedown unless the grid is already in actionable mode
                if (mousedown && !me.getView().actionableMode) {
                    e.preventDefault();
                }
            }
        } else {
            ret = me.callParent(arguments);
        }
        return ret;
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        if (me.readOnly) {
            me.readOnly = false;
            me.setReadOnly(true);
        }
    },

    isReadOnly: function () {
        return this.readOnly;
    },

    /**
     * Enable or readOnly the component.
     * @param {Boolean} readOnly `true` to readOnly.
     */
    setReadOnly: function (readOnly) {
        if (this.readOnly == readOnly)
            return;
        var me = this,
            cls = me.readOnlyCls,
            items;
        me.readOnly = readOnly;

        items = me.up('tablepanel').el.select(me.getCellSelector());
        if (readOnly) {
            items.addCls(cls);
        } else {
            items.removeCls(cls);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    defaultRenderer: function (value, cellValues, record) {
        var cssPrefix = Ext.baseCSSPrefix,
            cls = cssPrefix + 'grid-checkcolumn';

        value = this.getValueFromRecord(this, record);
        if (this.disabled) {
            cellValues.tdCls += ' ' + this.disabledCls;
        }
        if (this.readOnly) {
            cellValues.tdCls += ' ' + this.readOnlyCls;
        }
        if (value) {
            cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
        }
        return '<div class="' + cls + '" role="button" tabIndex="0"></div>';
    },

    getValueFromRecord: function (column, record) {
        return record ? record.get(column.dataIndex) : undefined;
    },

    isRecordChecked: function (record) {
        var prop = this.property;
        if (prop) {
            return record[prop];
        }
        return this.getValueFromRecord(this, record);
    },

    setRecordCheck: function (record, checked, cell, row, e) {
        var me = this,
            prop = me.property;
        if (prop) {
            record[prop] = checked;
            me.updater(cell, checked);
        } else {
            if (me.contentPath && me.contentPath != '.') {
                var path = me.contentPath.split('.'),
                    data = record.data;

                if (path.length > 1) {
                    if (!data[path[0]])
                        data[path[0]] = {};

                    for (var i = 0; i < path.length; i++) {
                        if (i == path.length - 1) {
                            data [path[i]] = checked;
                        } else if (!data[path[i]]) {
                            data [path[i]] = {};
                        }
                        data = data[path[i]];
                    }
                }
            }

            record.set(me.dataIndex, checked);
        }
    },

    updater: function (cell, value) {
        cell = Ext.fly(cell);

        cell[this.disabled ? 'addCls' : 'removeCls'](this.disabledCls);
        cell[this.readOnly ? 'addCls' : 'removeCls'](this.readOnlyCls);
        Ext.fly(cell.down(this.getView().innerSelector, true).firstChild)[value ? 'addCls' : 'removeCls'](Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
    }
});