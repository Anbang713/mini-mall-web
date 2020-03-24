/**
 * Created by cRazy on 2016/9/23.
 */
Ext.define('overrides.grid.CellContext', {
    override: 'Ext.grid.CellContext',

    privates: {
        isFirstColumn: function () {
            var cell = this.getCell(true);
            if (cell) {
                return !cell.previousSibling;
            }
        },
        isLastColumn: function () {
            var cell = this.getCell(true);
            if (cell) {
                return !cell.nextSibling;
            }
        },
        getLastColumnIndex: function () {
            var row = this.getRow(true);
            if (row) {
                return row.lastChild.cellIndex;
            }
            return -1;
        },

        /**
         * @private
         * Navigates left or right within the current row.
         * @param {Number} direction `-1` to go towards the row start or `1` to go towards row end
         */
        navigate: function (direction) {
            var me = this,
                colIdx = me.colIdx,
                columns = me.view.getVisibleColumnManager().getColumns();
            // 在view有锁定列的时候，这边会把锁定列给算进去。导致跳cell。所以需要重新计算colIdx的位置
            Ext.Array.each(columns, function (column, index) {
                if (column === me.column) {
                    colIdx = index;
                }
            });
            switch (direction) {
                case -1:
                    do {
                        if (!colIdx) {
                            colIdx = columns.length - 1;
                        } else {
                            colIdx--;
                        }
                        me.setColumn(colIdx);
                    } while (// If we iterate off the start, wrap back to the end.
                        !me.getCell(true));
                    break;
                case 1:
                    do {
                        if (colIdx >= columns.length) {
                            colIdx = 0;
                        } else {
                            colIdx++;
                        }
                        me.setColumn(colIdx);
                    } while (// If we iterate off the end, wrap back to the start.
                        !me.getCell(true));
                    break;
            }
        }
    },
    statics: {
        compare: function (c1, c2) {
            return c1.rowIdx - c2.rowIdx || c1.colIdx - c2.colIdx;
        }
    }
});