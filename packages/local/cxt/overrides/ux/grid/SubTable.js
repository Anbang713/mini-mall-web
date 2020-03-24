/**
 * Created by cRazy on 2016/11/16.
 */
Ext.define('Cxt.overrides.ux.grid.SubTable', {
    override: 'Ext.ux.grid.SubTable',

    requires: [
        'Ext.data.Model'
    ],

    /**
     * 针对于headerColumn的配置
     */
    headerConfig: undefined,

    /**
     * 当当前行的数据为空的时候，隐藏
     */
    hideWhenEmpty: false,

    rowBodyTpl: ['<table class="' + Ext.baseCSSPrefix + 'grid-subtable">',
        '{%',
        'this.owner.renderTable(out, values);',
        '%}',
        '</table>'
    ],

    init: function (grid) {
        var me = this;

        me.callParent(arguments);
        Ext.Array.each(me.columns, function (column) {
            if (!column.align) {
                column.align = 'left';
            }
        });
    },

    onClick: function () {
        console.log('click', arguments);
    },

    renderTable: function (out, rowValues) {
        var me = this,
            columns = me.getVisibleColumns(me.columns),
            numColumns = columns.length,
            associatedRecords = me.getAssociatedRecords(rowValues.record),
            recCount = associatedRecords.length,
            rec, column, i, j, value;

        // 当设置了hideWhenEmpty的时候，recCount为空时，直接返回
        if (recCount == 0 && me.hideWhenEmpty) {
            return;
        }
        out.push('<thead>');
        for (j = 0; j < numColumns; j++) {
            out.push('<th class="' +
                Ext.baseCSSPrefix + 'grid-subtable-header ' +
                Ext.baseCSSPrefix + 'column-header-align-' + columns[j].align +
                '">', columns[j].text, '</th>');
        }
        out.push('</thead>');
        for (i = 0; i < recCount; i++) {
            rec = associatedRecords[i];
            if (Ext.isObject(rec)) {
                rec = Ext.create('Ext.data.Model', rec);
            }
            out.push('<tr>');
            for (j = 0; j < numColumns; j++) {
                column = columns[j];
                value = rec.get(column.dataIndex);
                if (column.renderer && column.renderer.call) {
                    value = column.renderer.call(column.scope || me, value, {}, rec);
                }
                out.push('<td class="' + Ext.baseCSSPrefix + 'grid-subtable-cell"');
                if (column.width != null) {
                    out.push(' style="width:' + column.width + 'px"');
                }
                out.push('><div class="' +
                    Ext.baseCSSPrefix + 'grid-cell-inner ' +
                    Ext.baseCSSPrefix + 'column-header-align-' + column.align +
                    '">', value, '</div></td>');
            }
            out.push('</tr>');
        }
    },

    getVisibleColumns: function (columns) {
        return Ext.Array.filter(columns, function (column) {
            return !column.hidden;
        });
    },

    getAssociatedRecords: function (record) {
        return record.get(this.association);
    },

    getHeaderConfig: function () {
        var me = this,
            headerColumn = me.callParent(arguments);

        return Ext.apply(headerColumn, me.headerConfig, {
            renderer: function (value, meteData, record) {
                if (me.hideWhenEmpty) {
                    var associatedRecords = me.getAssociatedRecords(record),
                        recCount = associatedRecords.length;
                    if (recCount == 0)
                        return;
                }
                return '<div class="' + Ext.baseCSSPrefix + 'grid-row-expander" role="presentation" tabIndex="0"></div>';
            },
            processEvent: function (type, view, cell, rowIndex, cellIndex, e, record) {
                if (me.hideWhenEmpty) {
                    var associatedRecords = me.getAssociatedRecords(record),
                        recCount = associatedRecords.length;
                    if (recCount == 0)
                        return;
                }
                if ((type === "click" && e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-expander')) || (type === 'keydown' && e.getKey() === e.SPACE)) {
                    me.toggleRow(rowIndex, record);
                    return me.selectRowOnExpand;
                }
            }
        });
    },

    toggleRow: function (rowIdx, record) {
        var me = this;
        if (me.hideWhenEmpty) {
            var associatedRecords = me.getAssociatedRecords(record),
                recCount = associatedRecords.length;
            if (recCount == 0)
                return;
        }
        me.callParent(arguments);
    }
});