/**
 * Created by Administrator on 2020/3/25.
 */
Ext.define('account.view.statement.view.StatementView', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'account.statement.view',

    requires: [],

    viewModel: {
        formulas: {
            isEffect: function (get) {
                return get('entity.state') == 'effect';
            },
            sumTotal: function (get) {
                var details = get('entity.details');
                var total = 0;
                Ext.Array.each(details, function (detail) {
                    total = total.add(detail['total']);
                });
                return Ext.util.Format.number(total, ',#.00');
            },
            sumSalesTotal: function (get) {
                var details = get('entity.details');
                var total = 0;
                Ext.Array.each(details, function (detail) {
                    total = total.add(detail['salesTotal']);
                });
                return Ext.util.Format.number(total, ',#.00');
            }
        }
    },
    controller: 'account.statement.view',

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'account.statement',
            searchXtype: 'account.statement.combo',
            titleItems: [{
                xtype: 'bizstatelabel',
                styleMapping: {
                    unPay: 'cre-state-unavailable',
                    payed: 'cre-state-available'
                },
                captionMapping: {
                    'unPay': '未收款',
                    'payed': '已收款'
                },
                bind: {
                    value: '{entity.payState}'
                }
            }, {
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
                bind: '账单：{entity.billNumber}'
            }],
            rightItems: [{
                xtype: 'authorbutton',
                text: '新建',
                ui: 'primary',
                iconCls: 'fa fa-plus',
                handler: 'doCreate',
                authorization: false
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
                authorization: false,
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
            }, '->', {
                xtype: 'label',
                bind: '<span style="font-size: 15px;font-weight: 700;">本次结算总金额：</span>' +
                    '<span style="font-weight: 700;font-size: 22px;color: #5FA2DD;line-height: 30px;">{sumTotal}</span>'
            }, {
                xtype: 'label',
                bind: '<span style="font-size: 15px;font-weight: 700;">本次销售总金额：</span>' +
                    '<span style="font-weight: 700;font-size: 22px;color: #5FA2DD;line-height: 30px;">{sumSalesTotal}</span>'
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
                    fieldLabel: '出账日期',
                    bind: '{entity.accountDate}',
                    renderer: Ext.util.Format.dateRenderer('Y-m-d')
                }, {
                    fieldLabel: '销售提成率',
                    bind: '{entity.salesRate}',
                    renderer: Ext.util.Format.percentRenderer(',#.##')
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
            xtype: 'account.statement.detail.panel',
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
        account.view.statement.StatementService.load(me.urlParams).then(function (entity) {
            me.down('#operatelog').setObjectId(me.module.moduleKeyPrefix + entity['uuid']);
            me.getViewModel().setData({
                entity: entity
            });
        });
    }
});