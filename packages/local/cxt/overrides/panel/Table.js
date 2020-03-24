/**
 * Created by cRazy on 2016/9/26.
 */
Ext.define('overrides.panel.Table', {
    override: 'Ext.panel.Table',

    focusOwner: undefined,


    /**
     * @private
     * @inheritdoc
     */
    beforeDestroy: function () {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.getStore()
            );
        }
        me.callParent(arguments);
    }
});