/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('sales.view.salesinput.view.SalesInputView', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'sales.salesinput.view',

    requires: [],

    viewModel: {
        formulas: {
            isEffect: function (get) {
                return get('entity.state') == 'effect';
            }
        }
    },
    controller: 'sales.salesinput.view',

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'sales.salesinput',
            searchXtype: 'sales.salesinput.combo',
            titleItems: [{
                xtype: 'bizstatelabel',
                captionMapping: {
                    'effect': '已生效',
                    'ineffect': '未生效'
                },
                bind: {
                    value: '{entity.state}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                bind: '销售数据录入单：{entity.billNumber}'
            }],
            rightItems: [{
                xtype: 'authorbutton',
                text: '新建',
                ui: 'primary',
                iconCls: 'fa fa-plus',
                handler: 'doCreate',
                authorization: true
            }]
        };
    },

    createToolbar: function () {
        return {
            items: [{
                xtype: 'authorbutton',
                text: '编辑',
                ui: 'primary',
                hidden: true,
                handler: 'doEdit',
                authorization: true,
                bind: {
                    hidden: '{isEffect}'
                }
            }, {
                xtype: 'authorbutton',
                text: '删除',
                ui: 'danger',
                hidden: true,
                handler: 'doDelete',
                authorization: true,
                bind: {
                    hidden: '{isEffect}'
                }
            }, {
                xtype: 'authorbutton',
                text: '生效',
                ui: 'primary',
                hidden: true,
                handler: 'doEffect',
                authorization: true,
                bind: {
                    hidden: '{isEffect}'
                }
            }]
        };
    },

    createItems: function () {
        var me = this;
        return [
            me.createGeneralPanel(),
            me.createDetailPanel(),
            me.createRemarkPanel()
        ]
    },

    createGeneralPanel: function () {
        var me = this;
        return {
            xtype: 'tabpanel',
            width: '100%',
            title: '概要信息',
            ui: 'link',
            deferredRender: false,
            tabBarHeaderPosition: 1,
            header: {
                toolAlign: 'left'
            },
            items: [{
                title: '基本信息',
                xtype: 'form',
                items: [{
                    fieldLabel: '单号',
                    bind: '{entity.billNumber}'
                }, {
                    xtype: 'cpnt.investment.store.link',
                    bind: {
                        entityId: '{entity.storeUuid}'
                    }
                }, {
                    xtype: 'cpnt.investment.tenant.link',
                    bind: {
                        entityId: '{entity.tenantUuid}'
                    }
                }, {
                    xtype: 'cpnt.investment.contract.link',
                    bind: {
                        entityId: '{entity.contractUuid}'
                    }
                }, {
                    xtype: 'cpnt.sales.paymenttype.link',
                    bind: {
                        entityId: '{entity.paymentTypeUuid}'
                    }
                }, {
                    fieldLabel: '销售总金额',
                    bind: '{entity.payTotal}',
                    renderer: Ext.util.Format.numberRenderer(',#.00')
                }]
            }, {
                title: '操作日志',
                width: '100%',
                xtype: 'operatelog',
                itemId: 'operatelog'
            }]
        }
    },

    createDetailPanel: function () {
        return {
            xtype: 'sales.salesinput.detail.panel',
            editable: false,
            bind: {
                details: '{entity.details}'
            }
        }
    },

    createRemarkPanel: function () {
        return {
            xtype: 'textareapanel',
            width: '100%',
            title: '说明',
            ui: 'primary',
            hidden: true,
            bind: {
                hidden: '{!entity.remark}'
            },
            textareaConfig: {
                readOnly: true,
                bind: {
                    value: '{entity.remark}'
                }
            }
        }
    },

    onRefresh: function () {
        var me = this;
        me.callParent(arguments);
        me.loadEntity();
    },

    loadEntity: function () {
        var me = this;
        sales.view.salesinput.SalesInputService.load(me.urlParams).then(function (entity) {
            me.down('#operatelog').setObjectId(me.module.moduleKeyPrefix + entity['uuid']);
            me.getViewModel().setData({
                entity: entity
            });
        });
    }
});