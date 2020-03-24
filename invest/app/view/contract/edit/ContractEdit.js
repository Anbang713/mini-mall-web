/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.contract.edit.ContractEdit', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: ['invest.contract.create', 'invest.contract.edit'],

    controller: 'invest.contract.edit',
    viewModel: {},

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'invest.contract',
            searchXtype: 'invest.contract.combo',
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
                    text: '新建合同',
                    hidden: '{entity.uuid}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                hidden: true,
                bind: {
                    text: '合同：{entity.signboard}[{entity.serialNumber}]',
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
                fieldLabel: '项目(甲方)',
                bind: {
                    value: '{entity.storeUuid}',
                    readOnly: '{entity.uuid}'
                }
            }, {
                xtype: 'cpnt.investment.tenant.combo',
                allowBlank: false,
                fieldLabel: '商户(乙方)',
                bind: {
                    value: '{entity.tenantUuid}'
                }
            }, {
                xtype: 'textfield',
                allowBlank: false,
                fieldLabel: '店招',
                maxLength: 64,
                bind: '{entity.signboard}'
            }, {
                xtype: 'daterangefield',
                allowBlank: false,
                fieldLabel: '合同期',
                bind: {
                    beginValue: '{entity.beginDate}',
                    endValue: '{entity.endDate}'
                }
            }, {
                xtype: 'cpnt.investment.brand.combo',
                allowBlank: false,
                fieldLabel: '品牌',
                bind: {
                    value: '{entity.brandUuid}'
                }
            }, {
                xtype: 'cpnt.investment.biztype.combo',
                allowBlank: false,
                fieldLabel: '业态',
                bind: {
                    value: '{entity.biztypeUuid}'
                }
            }, {
                xtype: 'cpnt.investment.floor.combo',
                allowBlank: false,
                fieldLabel: '核算楼层',
                storeLimit: true,
                bind: {
                    storeUuid: '{entity.storeUuid}',
                    value: '{entity.floorUuid}'
                },
                listeners: {
                    select: function (field, record) {
                        me.getViewModel().set('entity.buildingUuid', record ? record.get('buildingUuid') : undefined);
                    }
                }
            }, {
                xtype: 'cpnt.investment.position.combo',
                allowBlank: false,
                fieldLabel: '铺位',
                storeLimit: true,
                bind: {
                    storeUuid: '{entity.storeUuid}',
                    value: '{entity.positionUuid}'
                }
            }, {
                xtype: 'numberfield',
                decimalPrecision: 2,
                fieldStyle: 'text-align:right',
                allowBlank: false,
                fieldLabel: '月租金',
                bind: '{entity.monthRent}'
            }, {
                xtype: 'numberfield',
                decimalPrecision: 4,
                fieldStyle: 'text-align:right',
                suffix: Ext.util.Format.percentSign,
                maxValue: 1,
                suffixWidth: 20,
                allowBlank: false,
                fieldLabel: '销售提成率',
                bind: '{entity.salesRate}'
            }, {
                xtype: 'cpnt.account.subject.combo',
                fieldLabel: '科目',
                allowBlank: false,
                bind: '{entity.subjectUuid}',
                listeners: {
                    select: function (field, record) {
                        me.getViewModel().set('entity.taxRate', record ? record.get('taxRate') : undefined);
                    }
                }
            }, {
                fieldLabel: '税率',
                bind: '{entity.taxRate}',
                renderer: Ext.util.Format.percentRenderer(',#.##')
            }]
        };
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
        invest.view.contract.ContractService.load(me.urlParams).then(function (entity) {
            me.getViewModel().setData({
                entity: entity
            });
        });
    },

    createEntity: function () {
        var me = this;
        me.getViewModel().setData({
            entity: {
                state: 'ineffect'
            }
        });
    }
});