/**
 * Created by Administrator on 2020/3/22.
 */
Ext.define('product.view.goods.inbound.view.GoodsInboundView', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'product.goods.inbound.view',

    requires: [],

    viewModel: {
        formulas: {
            isEffect: function (get) {
                return get('entity.state') == 'effect';
            }
        }
    },
    controller: 'product.goods.inbound.view',

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
                bind: {
                    value: '{entity.state}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                bind: '商品入库单：{entity.billNumber}'
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
                    fieldLabel: '入库日期',
                    bind: '{entity.inboundDate}',
                    renderer: Ext.util.Format.dateRenderer('Y-m-d')
                }, {
                    fieldLabel: '仓库',
                    bind: '{entity.warehouse}'
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
            xtype: 'product.goods.inbound.detail.panel',
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
        product.view.goods.inbound.GoodsInboundService.load(me.urlParams).then(function (entity) {
            me.down('#operatelog').setObjectId(me.module.cacheKeyPrefix + entity['uuid']);
            me.getViewModel().setData({
                entity: entity
            });
        });
    }
});