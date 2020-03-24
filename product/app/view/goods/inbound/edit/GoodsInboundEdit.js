/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.edit.GoodsInboundEdit', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: ['product.goods.inbound.create', 'product.goods.inbound.edit'],

    controller: 'product.goods.inbound.edit',
    viewModel: {},

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'product.goods.inbound',
            searchXtype: 'product.goods.inbound.combo',
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
                    text: '新建商品入库单',
                    hidden: '{entity.uuid}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                hidden: true,
                bind: {
                    text: '商品入库单：{entity.billNumber}',
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
        return {
            xtype: 'form',
            width: '100%',
            title: '基本信息',
            ui: 'primary',
            items: [{
                xtype: 'datefield',
                allowBlank: false,
                fieldLabel: '入库日期',
                bind: '{entity.inboundDate}'
            }, {
                xtype: 'cpnt.product.warehouse.combo',
                allowBlank: false,
                fieldLabel: '仓库',
                bind: '{entity.warehouse}'
            }]
        };
    },

    createDetailPanel: function () {
        return {
            xtype: 'product.goods.inbound.detail.panel',
            bind: {
                details: '{entity.details}',
                warehouse: '{entity.warehouse}'
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
        product.view.goods.inbound.GoodsInboundService.load(me.urlParams).then(function (entity) {
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
                inboundDate: new Date(),
                details: [{}]
            }
        });
    }
});