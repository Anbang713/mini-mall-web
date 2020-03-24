/**
 * Created by cRazy on 2017/6/27.
 */
Ext.define('overrides.grid.header.DragZone', {
    override: 'Ext.grid.header.DragZone',

    onBeforeDrag: function () {
        var columns = this.headerCt.getVisibleGridColumns(),
            dragable = 0;
        Ext.Array.each(columns, function (column) {
            if (column.dataIndex) {
                dragable++;
            }
        });

        // 对于dataIndex所标记的列，不大于1个的，没有必要支出拖拽
        return dragable > 1 && !(this.headerCt.dragging || this.disabled);
    }
});