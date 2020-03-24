/**
 * Created by cRazy on 2016/10/26.
 */
Ext.define('overrides.data.Store', {
    override: 'Ext.data.Store',

    /**
     * Query all the cached records in this Store by field.
     *
     * This method is not affected by filtering, it will always search *all* records in the store
     * regardless of filtering.
     *
     * @param {String} field The field from each record to use.
     * @param {Object} value The value to match.
     * @return {Ext.data.Model[]} The matched records.
     *
     * @private
     */
    queryRecords: function (field, value) {
        var data = this.getData(),
            matches = [],
            len, i, record;

        data = (data.getSource() || data).items;

        for (i = 0, len = data.length; i < len; ++i) {
            record = data[i];
            if (field === '.') {
                if (record.getData() === value) {
                    matches.push(record);
                }
            } else if (record.get(field) === value) {
                matches.push(record);
            }
        }
        return matches;
    }
});