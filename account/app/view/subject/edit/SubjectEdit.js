/**
 * Created by gengpan on 2017/2/15.
 */
Ext.define('account.view.subject.edit.SubjectEdit', {
    extend: 'Cpnt.frame.BaseContentPanel',
    xtype: ['account.subject.create', 'account.subject.edit'],

    controller: 'account.subject.edit',
    viewModel: {},

    createTitlebar: function () {
        return {
            xtype: 'typicalmoduletitlebar',
            router: 'account.subject',
            searchXtype: 'account.subject.combo',
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
                    text: '新建科目',
                    hidden: '{entity.uuid}'
                }
            }, {
                xtype: 'label',
                cls: 'topTitle',
                hidden: true,
                bind: {
                    text: '科目：{entity.name}[{entity.code}]',
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
            layout: 'column',
            items: [{
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
            }, {
                xtype: 'numberfield',
                decimalPrecision: 4,
                fieldStyle: 'text-align:right',
                suffix: Ext.util.Format.percentSign,
                maxValue: 1,
                suffixWidth: 20,
                allowBlank: false,
                fieldLabel: '税率',
                bind: '{entity.taxRate}'
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
        account.view.subject.SubjectService.load(me.urlParams).then(function (entity) {
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