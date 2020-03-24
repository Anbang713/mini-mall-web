/**
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.sales.paymentType.PaymentTypeSelectWindow', {
    extend: 'Ext.window.Window',
    xtype: 'cpnt.sales.paymentType.select.window',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.Toast',
        'Ext.button.Button',
        'Ext.data.Store',
        'Ext.data.proxy.Ajax',
        'Ext.grid.Panel',
        'Ext.toolbar.Fill'
    ],

    title: '选择付款方式',

    selections: [],

    closeAction: 'destroy',
    constrainPosition: 'center',
    width: 480,
    modal: true,

    viewModel: {},

    /**
     * @cfg {String[]} expects
     * 过滤付款方式，不能超过1000个
     */
    expects: [],

    /**
     * @cfg {String[]} state
     * 项目状态。可选值：enabled，disabled。
     * 默认为enabled。
     */
    state: ['enabled'],

    selModel: {
        selType: 'checkboxmodel',
        mode: 'MULTI',
        fireEach: true
    },

    /**
     * 列，使用者可以根据实际情况自行编码
     */
    columns: [{
        scroll: true,
        dataIndex: 'code',
        text: '代码',
        minWidth: 180,
        flex: 1
    }, {
        dataIndex: 'name',
        text: '名称',
        width: 220
    }],

    initComponent: function () {
        var me = this,
            store = me.createStore(),
            dockedItems = Ext.Array.from(me.dockedItems);

        me.selections = [];

        dockedItems.push({
            xtype: 'toolbar',
            width: '100%',
            dock: 'bottom',
            items: ['->', {
                xtype: 'button',
                text: '确定',
                ui: 'primary',
                width: 80,
                scale: 'medium',
                handler: function () {
                    if (Ext.isEmpty(me.selections) || me.selections.length == 0) {
                        Cxt.util.Toast.warning('请选择付款方式');
                    } else {
                        me.fireEvent('select', me, me.selections);
                        me.close();
                    }
                }
            }, {
                xtype: 'button',
                text: '取消',
                width: 80,
                scale: 'medium',
                handler: function () {
                    me.close();
                }
            }, '->']
        });
        // dockedItems.push({
        //     xtype: 'pagingtoolbar',
        //     store: store,
        //     dock: 'bottom',
        //     displayInfo: true
        // });

        Ext.apply(me, {
            dockedItems: dockedItems,
            items: [{
                xtype: 'grid',
                itemId: 'grid',
                store: store,
                maxHeight: 400,
                selModel: me.selModel,
                columns: me.columns,
                listeners: {
                    select: function (grid, records) {
                        Ext.Array.each(records, function (record) {
                            if (!Ext.Array.findBy(me.selections, function (item) {
                                    return item['uuid'] == record.get('uuid');
                                })) {
                                me.selections.push(record.getData());
                            }
                        });
                    },
                    deselect: function (grid, records) {
                        Ext.Array.each(records, function (record) {
                            Ext.Array.remove(me.selections, Ext.Array.findBy(me.selections, function (item) {
                                return item['uuid'] == record.get('uuid');
                            }));
                        });
                    }
                }

            }]
        });

        me.callParent(arguments);
    },

    createStore: function () {
        var me = this;

        return Ext.create('Ext.data.Store', {
            type: 'store',
            // pageSize: 10,
            remoteFilter: true,
            remoteSort: true,
            proxy: {
                type: 'ajax',
                url: 'sales/paymentType/query.hd',
                actionMethods: {
                    read: 'POST'
                },
                // limitParam: 'pageSize',
                // pageParam: 'page',
                startParam: '',
                paramsAsJson: true,
                extraParams: {},
                reader: {
                    type: 'queryResult',
                    rootProperty: 'records',
                    totalProperty: 'recordCount'
                }
            },
            sorters: [{
                property: 'code',
                direction: 'ASC'
            }],
            listeners: {
                load: function (store, records, successful, operation) {
                    if (!Ext.isEmpty(operation.getResultSet())) {
                        me.getViewModel().set('tagExtras', operation.getResultSet().summary);
                    }
                    var selModel = me.down('#grid').view.selModel;
                    selModel.setSelected(me.selections);
                    Ext.Array.each(me.selections, function (selection) {
                        selModel.select(Ext.Array.findBy(records, function (record) {
                            return selection['uuid'] == record.get('uuid');
                        }), true, true)
                    });
                    me.fireEvent('storeload', me, records, successful, operation);
                },
                scope: me
            }
        });
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
    },

    onShow: function () {
        var me = this;
        me.callParent(arguments);
        me.doSearch();
    },

    /**
     * 执行查询操作
     */
    doSearch: function () {
        var me = this, store = me.down('grid').getStore(),
            filter;
        if (!me.rendered) {
            return;
        }

        if (store.isLoading()) {
            store.getProxy().terminate();
        }

        filter = me.supplyFilter();
        store.getProxy().setExtraParams({
            filter: filter
        });

        store.load();
    },

    supplyFilter: function (filter) {
        var me = this;
        filter = Ext.valueFrom(filter, {});

        if (me.state) {
            filter.state = me.state;
        }
        if (me.expects && me.expects.length) {
            filter.expects = Ext.Array.from(me.expects);
        }
        return filter;
    }

});