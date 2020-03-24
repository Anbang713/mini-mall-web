/**
 * Created by cRazy on 2016/9/28.
 */
Ext.define('overrides.menu.Menu', {
    override: 'Ext.menu.Menu',

    requires: [
        'Ext.menu.Separator'
    ],

    /**
     * @cfg {String} closeAction
     * The action to take when the close header tool is clicked:
     *
     * - **`'{@link #method-destroy}'`** :
     *
     *   {@link #method-remove remove} the window from the DOM and {@link Ext.Component#method-destroy destroy} it and all descendant
     *   Components. The window will **not** be available to be redisplayed via the {@link #method-show} method.
     *
     * - **`'{@link #method-hide}'`** :
     *
     *   {@link #method-hide} the window by setting visibility to hidden and applying negative offsets. The window will be
     *   available to be redisplayed via the {@link #method-show} method.
     *
     * **Note:** This behavior has changed! setting *does* affect the {@link #method-close} method which will invoke the
     * appropriate closeAction.
     */
    closeAction: 'hide',

    onHide: function (animateTarget, cb, scope) {
        var me = this;
        me.callParent(arguments);
        if (me.closeAction === 'destroy') {
            Ext.defer(me.destroy, 10, me);
        }
    },

    onShow: function () {
        var me = this;
        me.callParent(arguments);
        me.minimizeSeparators();
    },

    /**
     * 精简多余的分隔条，多余的分隔条会被隐藏，若发现之前被精简分隔条的现在已不需要精简，则重新显示之。
     */
    minimizeSeparators: function () {
        var me = this,
            last;
        if (me.minimizing === true)
            return;

        me.minimizing = true;
        me.items.each(function (item) {
            if (item instanceof Ext.menu.Separator) {
                var visible = last != null && !(last instanceof Ext.menu.Separator);
                item.setHidden(!visible);
            }
            if (item.isVisible()) {
                last = item;
            }
        });

        // 隐藏尾部多余的分隔条
        if (last && last instanceof Ext.menu.Separator)
            last.setHidden(true);
        me.minimizing = false;
    }
});