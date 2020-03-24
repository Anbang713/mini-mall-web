/**
 * Created by cRazy on 2016/12/28.
 */
Ext.define('overrides.util.Sorter', {
    override: 'Ext.util.Sorter',

    /**
     * @private
     * Basic default sorter function that just compares the defined property of each object.
     * This is hidden by the `sorterFn` provided by the user.
     */
    sortFn: function (item1, item2) {
        var me = this,
            transform = me._transform,
            root = me._root,
            property = me._property,
            lhs, rhs;
        if (root) {
            item1 = item1[root];
            item2 = item2[root];
        }
        lhs = item1[property];
        rhs = item2[property];
        if (transform) {
            lhs = transform(lhs);
            rhs = transform(rhs);
        }

        if (lhs === rhs) return 0;
        if (lhs && Ext.isEmpty(rhs)) return -1;
        else if (Ext.isEmpty(lhs) && rhs) return 1;
        else if (lhs > rhs == lhs < rhs) return 0;
        return (lhs > rhs) ? 1 : (lhs < rhs ? -1 : 0);
    }
});