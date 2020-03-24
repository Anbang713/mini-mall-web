Ext.define('overrides.dd.DragZone', {
    override: 'Ext.dd.DragZone',

    b4Drag: function (e) {
        var xy = e.getXY();
        this.deltaSetXY = false;
        this.setDragElPos(xy[0], xy[1]);
    }

});