/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('sales.view.salesinput.edit.SalesInputEdit', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: ['sales.salesinput.create', 'sales.salesinput.edit'],

    controller: 'sales.salesinput.edit',
    viewModel: {},

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
                hidden: true,
                bind: {
                    value: '{entity.state}',
                    hidden: '{!entity.uuid}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                bind: {
                    text: '新建销售数据录入单',
                    hidden: '{entity.uuid}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                hidden: true,
                bind: {
                    text: '销售数据录入单：{entity.billNumber}',
                    hidden: '{!entity.uuid}'
                }
            }]
        };
    },

    createToolbar: function () {
        return {
            items: [{
                xtype: 'button',
                text: '保存',
                iconCls: 'fa fa-save',
                ui: 'primary',
                listeners: {
                    click: 'doSave'
                }
            }, {
                xtype: 'button',
                text: '取消',
                iconCls: 'fa fa-remove',
                listeners: {
                    click: 'doCancel'
                }
            }]
        };
    },

    createItems: function () {
        var me = this;
        return [
            me.createBasicInfoPanel(),
            me.createDetailPanel(),
            me.createRemarkPanel()
        ]
    },

    createBasicInfoPanel: function () {
        var me = this;
        return {
            xtype: 'form',
            width: '100%',
            title: '基本信息',
            ui: 'primary',
            items: [{
                xtype: 'cpnt.investment.store.combo',
                allowBlank: false,
                fieldLabel: '项目',
                bind: '{entity.storeUuid}'
            }, {
                xtype: 'cpnt.investment.tenant.combo',
                allowBlank: false,
                fieldLabel: '商户',
                bind: '{entity.tenantUuid}',
                listeners: {
                    select: function (field, record) {
                        me.down('#contractCombo').setTenantUuid(record ? record.get('uuid') : undefined);
                        me.getViewModel().set('entity.contractUuid', undefined);
                    }
                }
            }, {
                xtype: 'cpnt.investment.contract.combo',
                allowBlank: false,
                fieldLabel: '合同',
                itemId: 'contractCombo',
                storeLimit: true,
                bind: {
                    storeUuid: '{entity.storeUuid}',
                    value: '{entity.contractUuid}'
                },
                listeners: {
                    select: function (field, record) {
                        if (Ext.isEmpty(me.getViewModel().get('entity.tenantUuid'))) {
                            me.getViewModel().set('entity.tenantUuid', record ? record.get('tenantUuid') : undefined);
                        }
                    }
                }
            }, {
                xtype: 'cpnt.sales.paymentType.combo',
                allowBlank: false,
                fieldLabel: '付款方式',
                bind: '{entity.paymentTypeUuid}'
            }, {
                fieldLabel: '销售总金额',
                bind: '{entity.payTotal}',
                renderer: Ext.util.Format.numberRenderer(',#.00')
            }]
        };
    },

    createDetailPanel: function () {
        var me = this;
        return {
            xtype: 'sales.salesinput.detail.panel',
            bind: {
                details: '{entity.details}'
            },
            listeners: {
                totalChange: function () {
                    var payTotal = 0;
                    Ext.Array.each(me.getViewModel().get('entity.details'), function (detail) {
                        if (Ext.isEmpty(detail['total']) == false) {
                            payTotal = payTotal.add(detail['total']);
                        }
                    })
                    me.getViewModel().set('entity.payTotal', payTotal);
                }
            }
        }
    },

    createRemarkPanel: function () {
        return {
            xtype: 'textareapanel',
            width: '100%',
            title: '说明',
            ui: 'primary',
            textareaConfig: {
                maxLength: 1024,
                bind: {
                    value: '{entity.remark}'
                }
            }
        }
    },

    onRefresh: function () {
        var me = this;
        me.callParent(arguments);
        if (me.urlParams.uuid) {
            me.loadEntity();
        } else {
            me.createEntity();
        }
    },

    loadEntity: function () {
        var me = this;
        sales.view.salesinput.SalesInputService.load(me.urlParams).then(function (entity) {
            me.getViewModel().setData({
                entity: entity
            });
        });
    },

    createEntity: function () {
        var me = this;
        me.getViewModel().setData({
            entity: {
                state: 'ineffect',
                payTotal: 0,
                details: [{}]
            }
        });
    }
});