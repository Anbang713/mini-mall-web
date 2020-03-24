/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('invest.view.position.edit.PositionEdit', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: ['invest.position.create', 'invest.position.edit'],

    controller: 'invest.position.edit',
    viewModel: {},

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'invest.position',
            searchXtype: 'invest.position.combo',
            titleItems: [{
                xtype: 'bizstatelabel',
                captionMapping: {
                    using: '使用中',
                    disabled: '已停用'
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
                    text: '新建铺位',
                    hidden: '{entity.uuid}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                hidden: true,
                bind: {
                    text: '铺位：{entity.name}[{entity.code}]',
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
        return {
            xtype: 'form',
            width: '100%',
            title: '基本信息',
            ui: 'primary',
            items: [{
                xtype: 'cpnt.investment.store.combo',
                allowBlank: false,
                fieldLabel: '项目',
                bind: {
                    value: '{entity.storeUuid}',
                    readOnly: '{entity.uuid}'
                }
            }, {
                xtype: 'cpnt.investment.building.combo',
                allowBlank: false,
                fieldLabel: '楼宇',
                storeLimit: true,
                bind: {
                    storeUuid: '{entity.storeUuid}',
                    value: '{entity.buildingUuid}',
                    readOnly: '{entity.uuid}'
                }
            }, {
                xtype: 'cpnt.investment.floor.combo',
                allowBlank: false,
                fieldLabel: '楼层',
                storeLimit: true,
                buildingLimit: true,
                bind: {
                    storeUuid: '{entity.storeUuid}',
                    buildingUuid: '{entity.buildingUuid}',
                    value: '{entity.floorUuid}',
                    readOnly: '{entity.uuid}'
                }
            }, {
                xtype: 'textfield',
                allowBlank: false,
                fieldLabel: '代码',
                maxLength: 32,
                regex: Cxt.Regex.code.regex,
                regexText: Cxt.Regex.code.regexText,
                bind: {
                    value: '{entity.code}',
                    readOnly: '{entity.uuid}'
                }
            }, {
                xtype: 'textfield',
                allowBlank: false,
                fieldLabel: '名称',
                maxLength: 64,
                bind: '{entity.name}'
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
        invest.view.position.PositionService.load(me.urlParams).then(function (entity) {
            me.getViewModel().setData({
                entity: entity
            });
        });
    },

    createEntity: function () {
        var me = this;
        me.getViewModel().setData({
            entity: {
                state: 'using'
            }
        });
    }
});