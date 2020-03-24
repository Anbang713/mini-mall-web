/**
 * Created by cRazy on 2016/10/24.
 */
Ext.define('overrides.grid.column.RowNumberer', {
    override: 'Ext.grid.column.RowNumberer',

    /**
     * 标准行号宽度
     */
    width: 40,

    /**
     * 默认的标题
     */
    text: '行',

    /**
     * 默认居中
     */
    align: 'center',

    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            text: '行'
        });
        me.callParent(arguments);
    }
});