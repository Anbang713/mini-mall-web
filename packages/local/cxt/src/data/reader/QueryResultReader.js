/**
 * 带有附加信息的搜索结果数据Reader
 * Created by cRazy on 2016/6/17.
 */
Ext.define('Cxt.data.reader.QueryResultReader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.queryResult',

    rootProperty: 'records',
    totalProperty: 'total',

    readRecords: function (data, readOptions, internalReadOptions) {
        var me = this,
            recordsOnly = internalReadOptions && internalReadOptions.recordsOnly;
        var records = me.callParent([data, readOptions, internalReadOptions]);
        if (recordsOnly)
            return records;
        records.summary = data.summary;
        return records;
    }
});