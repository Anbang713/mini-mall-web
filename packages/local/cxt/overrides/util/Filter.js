/**
 * Created by cRazy on 2016/12/28.
 */
Ext.define('overrides.util.Filter', {
    override: 'Ext.util.Filter',

    /**
     * Returns the property of interest from the given item, based on the configured `root`
     * and `property` configs.
     * @param {Object} item The item.
     * @return {Object} The property of the object.
     * @private
     */
    getPropertyValue: function (item) {
        var root = this._root,
            _property = this._property,
            value = (root == null) ? item : item[root];
        if (_property === '.')
            return value;
        var params = _property.split('.'),
            o = value[params[0]];
        for (var i = 1; i < params.length; i++) {
            if (o)
                o = o[params[i]];
        }
        return o;
    }
});