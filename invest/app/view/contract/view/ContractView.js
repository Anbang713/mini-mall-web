/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.contract.view.ContractView', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'invest.contract.view',

    requires: [
        'Cxt.button.AuthorButton',
        'Cxt.form.field.BizStateLabel',
        'Cxt.titlebar.TypicalModuleTitleBar',
        'Ext.form.Label'
    ],

    viewModel: {
        formulas: {
            isEffect: function (get) {
                return get('entity.state') == 'effect';
            },
            contractRange: function (get) {
                var dateRange = {
                    beginDate: get('entity.beginDate'),
                    endDate: get('entity.endDate')
                };
                return Ext.util.Format.dateRange(dateRange)
            }
        }
    },
    controller: 'invest.contract.view',

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
                bind: {
                    value: '{entity.state}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                bind: '合同：{entity.signboard}[{entity.serialNumber}]'
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
                    xtype: 'cpnt.investment.store.link',
                    fieldLabel: '项目(甲方)',
                    bind: {
                        entityId: '{entity.storeUuid}'
                    }
                }, {
                    xtype: 'cpnt.investment.tenant.link',
                    fieldLabel: '商户(乙方)',
                    bind: {
                        entityId: '{entity.tenantUuid}'
                    }
                }, {
                    fieldLabel: '合同编号',
                    bind: '{entity.serialNumber}'
                }, {
                    fieldLabel: '店招',
                    bind: '{entity.signboard}'
                }, {
                    fieldLabel: '合同期',
                    bind: '{contractRange}'
                }, {
                    fieldLabel: '品牌',
                    bind: '{entity.brand}',
                    renderer: Ext.util.Format.ucnRenderer()
                }, {
                    fieldLabel: '业态',
                    bind: '{entity.bizType}',
                    renderer: Ext.util.Format.ucnRenderer()
                }, {
                    fieldLabel: '核算楼层',
                    bind: '{entity.floor}',
                    renderer: Ext.util.Format.ucnRenderer()
                }, {
                    fieldLabel: '铺位',
                    bind: '{entity.position}',
                    renderer: Ext.util.Format.ucnRenderer()
                }, {
                    fieldLabel: '月租金',
                    bind: '{entity.monthRent}',
                    renderer: Ext.util.Format.numberRenderer(',#.00')
                }, {
                    fieldLabel: '销售提成率',
                    bind: '{entity.salesRate}',
                    renderer: Ext.util.Format.percentRenderer(',#.##')
                }, {
                    xtype: 'cpnt.account.subject.link',
                    bind: {
                        entityId: '{entity.subjectUuid}'
                    }
                }, {
                    fieldLabel: '税率',
                    bind: '{entity.taxRate}',
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
        invest.view.contract.ContractService.load(me.urlParams).then(function (entity) {
            me.down('#operatelog').setObjectId(me.module.cacheKeyPrefix + entity['uuid']);
            me.getViewModel().setData({
                entity: entity
            });
        });
    }
});