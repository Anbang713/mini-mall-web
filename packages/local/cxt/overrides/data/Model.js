/**
 * Created by cRazy on 2016/10/13.
 */
Ext.define('overrides.data.Model', {
    override: 'Ext.data.Model',
    /**
     * Returns the value of the given field.
     * @param {String} fieldName The name of the field.
     * @return {Object} The value of the specified field.
     */
    get: function (fieldName) {
        var me = this;
        if (fieldName === '.' && Ext.isString(me.data)) {
            return me.data;
        }
        return me.data[fieldName];
    },
    /**
     * 如果data是String，则返回data。
     */
    getData: function (options) {
        var me = this, data;

        if (Ext.isString(me.data)) {
            return me.data;
        }
        if (Ext.isNumber(me.data)) {
            return me.data;
        }
        data = me.callParent(arguments);
        return Ext.clone(data);
    }

});