/**
 * Created by cRazy on 2017/8/22.
 */
Ext.define('overrides.data.proxy.Proxy', {
    override: 'Ext.data.proxy.Proxy',

    terminate: function () {
        var ops = this.pendingOperations,
            opId, op;

        for (opId in ops) {
            op = ops[opId];

            if (op && op.isRunning()) {
                op.abort();
            }
        }
    }
});