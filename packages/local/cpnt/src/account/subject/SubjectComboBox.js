/**
 * Created by cRazy on 2016/7/28.
 */
Ext.define('Cpnt.account.subject.SubjectComboBox', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'cpnt.account.subject.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Ext.data.proxy.Ajax'
    ],


    /**
     * @cfg {String[]} state
     * 科目状态。可选值：using，disabled。
     * 默认为using。
     */
    state: ['using'],

    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',

    labelTpl: new Ext.XTemplate(
        '<tpl if="code">',
        '{name}[{code}]',
        '<tpl else>',
        '',
        '</tpl>'
    ),

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item ', Ext.baseCSSPrefix + 'overflow-ellipsis">{name}[{code}]</li>',
        '</tpl>'
    ),

    valueField: 'uuid',
    valueParam: 'id',

    pageSize: 10,

    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        sorters: [{
            property: 'code',
            direction: 'ASC'
        }],
        proxy: {
            type: 'ajax',
            url: 'api/account/subject/query',
            actionMethods: {
                read: 'POST'
            },
            startParam: '',
            limitParam: 'pageSize',
            pageParam: 'page',
            paramsAsJson: true,
            extraParams: {},
            reader: {
                type: 'queryResult',
                rootProperty: 'records',
                totalProperty: 'recordCount'
            }
        }
    },

    buildFilter: function () {
        var me = this, filter = {};
        filter.state = me.state;
        return filter;
    }
});