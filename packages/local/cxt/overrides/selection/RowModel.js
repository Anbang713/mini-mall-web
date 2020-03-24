/**
 * Created by cRazy on 2016/9/27.
 */
Ext.define('overrides.selection.RowModel', {
    override: 'Ext.selection.RowModel',

    requires: [
        'Ext.grid.CellContext'
    ],

    selectByPosition: function (position, keepExisting) {
        if (!position)
            return;

        if (!position.isCellContext) {
            position = new Ext.grid.CellContext(this.view).setPosition(position.row, position.column);
        }
        this.select(position.record, keepExisting);
    }
});