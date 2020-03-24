/**
 * Created by cRazy on 2016/10/24.
 */
Ext.define('overrides.data.TreeStore', {
    override: 'Ext.data.TreeStore',

    /**
     * @private
     * Called from a node's collapse method
     */
    onNodeCollapse: function (parent, records, callback, scope) {
        var me = this,
            collapseIndex = me.indexOf(parent) + 1,
            lastNodeIndexPlus, key;

        // Only remove what is visible and therefore in the collection side of this store
        if (me.needsLocalFilter()) {
            records = Ext.Array.filter(records, me.filterVisible);
        }

        // Only attempt to remove the records if they are there.
        // Collapsing an ancestor node *immediately removes from the view, ALL its descendant nodes at all levels*.
        // But if the collapse was recursive, all descendant root nodes will still fire their
        // events. But we must ignore those events here - we have nothing to do.
        if (records.length) {
            key = me.data.getKey(records[0]);
            if (me.data.containsKey(key)) {// 当节点的第一个下级存在下级节点时，收缩异常

                // Calculate the index *one beyond* the last node we are going to remove.
                lastNodeIndexPlus = me.indexOfNextVisibleNode(parent);

                // Remove the whole collapsed node set.
                me.removeAt(collapseIndex, lastNodeIndexPlus - collapseIndex);
            }
        }
        Ext.callback(callback, scope);
    }
});