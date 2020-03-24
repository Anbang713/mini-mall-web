/**
 * Created by cRazy on 2016/9/26.
 */
Ext.define('overrides.grid.NavigationModel', {
    override: 'Ext.grid.NavigationModel',

    /**
     * @template
     * @protected
     * Called to focus an item in the client {@link Ext.view.View DataView}.
     * The default implementation adds the {@link #focusCls} to the passed item focuses it.
     * Subclasses may choose to keep focus in another target.
     *
     * For example {@link Ext.view.BoundListKeyNav} maintains focus in the input field.
     * @param {Ext.dom.Element} item
     * @return {undefined}
     */
    focusItem: function (item) {
        var me = this;
        item.addCls(this.focusCls);

        // 聚焦？好吧。太久远了。忘记是什么功能了。
        // item.focus();

        if (me.view && me.view.focusOwner) {
            me.view.highlightItem(item);
        } else {
            item.focus();
        }
    }
});