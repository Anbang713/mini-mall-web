/**
 * Created by Administrator on 2020/3/21.
 */
Ext.define('product.view.goods.view.GoodsView', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: 'product.goods.view',

    requires: [
        'Cxt.button.AuthorButton',
        'Cxt.form.field.BizStateLabel',
        'Cxt.titlebar.TypicalModuleTitleBar',
        'Ext.form.Label'
    ],

    viewModel: {
        formulas: {
            isUsing: function (get) {
                return get('entity.state') == 'using';
            }
        }
    },
    controller: 'product.goods.view',

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'product.goods',
            searchXtype: 'product.goods.combo',
            titleItems: [{
                xtype: 'bizstatelabel',
                captionMapping: {
                    'using': '使用中',
                    'disabled': '已停用'
                },
                bind: {
                    value: '{entity.state}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                bind: '商品：{entity.name}[{entity.code}]'
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
                    hidden: '{!isUsing}'
                }
            }, {
                xtype: 'authorbutton',
                text: '启用',
                ui: 'primary',
                hidden: true,
                itemId: 'enableBtn',
                handler: 'doEnable',
                authorization: true,
                bind: {
                    hidden: '{isUsing}'
                }
            }, {
                xtype: 'authorbutton',
                text: '停用',
                ui: 'danger',
                hidden: true,
                handler: 'doDisable',
                authorization: true,
                bind: {
                    hidden: '{!isUsing}'
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
                    fieldLabel: '代码',
                    bind: '{entity.code}'
                }, {
                    fieldLabel: '名称',
                    bind: '{entity.name}'
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
        product.view.goods.GoodsService.load(me.urlParams).then(function (entity) {
            me.down('#operatelog').setObjectId(me.module.cacheKeyPrefix + entity['uuid']);
            me.getViewModel().setData({
                entity: entity
            });
        });
    }
});