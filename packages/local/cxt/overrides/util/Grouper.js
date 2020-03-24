/**
 * Created by cRazy on 2017/8/24.
 */
Ext.define('overrides.util.Grouper', {
    override: 'Ext.util.Grouper',

    sortFn: function (item1, item2) {
        var me = this,
        // 默认返回''，否则无法比较分组
            lhs = Ext.valueFrom(me._groupFn(item1), ''),
            rhs = Ext.valueFrom(me._groupFn(item2), ''),
            property = me._sortProperty,
        // Sorter's sortFn uses "_property"
            root = me._root,
            sorterFn = me._sorterFn,
            transform = me._transform;
        // Items with the same groupFn result must be equal... otherwise we sort them
        // by sorterFn or sortProperty.
        if (lhs === rhs) {
            return 0;
        }
        if (property || sorterFn) {
            if (sorterFn) {
                return sorterFn.call(this, item1, item2);
            }
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
        }
        return (lhs > rhs) ? 1 : (lhs < rhs ? -1 : 0);
    }
});