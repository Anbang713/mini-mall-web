/**
 * Created by cRazy on 2016/7/27.
 */
Ext.define('Cxt.util.Toast', function () {
    var me; // holds our singleton instance

    return {
        singleton: true,

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },

        /** 成功对话框*/
        success: function (message, autoClose) {
            Ext.toast({
                layout: {
                    type: 'hbox',
                    align: 'center'
                },
                autoClose: autoClose !== false,
                bodyPadding: '0 10',
                items: [{
                    xtype: 'label',
                    cls: 'fa fa-check-circle',
                    style: 'color: #81CB31;font-size:32px;width:40px'
                }, {
                    xtype: 'label',
                    style: 'font-size:14px',
                    html: message
                }, {
                    xtype: 'button',
                    ui: 'hint',
                    html: '<span style="font-size: 16px">×</span>',
                    handler: function (btn) {
                        btn.up().hide();
                    }
                }],
                align: 't'
            });
        },

        /** 警告对话框*/
        warning: function (message, autoClose) {
            Ext.toast({
                layout: {
                    type: 'hbox',
                    align: 'center'
                },
                autoClose: autoClose !== false,
                bodyPadding: '0 10',
                items: [{
                    xtype: 'label',
                    cls: 'fa fa-exclamation-circle',
                    style: 'color: #FAAB20;font-size:32px;width:40px'
                }, {
                    xtype: 'label',
                    style: 'font-size:14px',
                    html: message
                }, {
                    xtype: 'button',
                    ui: 'hint',
                    html: '<span style="font-size: 16px">×</span>',
                    handler: function (btn) {
                        btn.up().hide();
                    }
                }],
                align: 't'
            });
        },

        /** 失败对话框*/
        failure: function (message, autoClose) {
            Ext.toast({
                layout: {
                    type: 'hbox',
                    align: 'center'
                },
                autoClose: autoClose !== false,
                bodyPadding: '0 10',
                items: [{
                    xtype: 'label',
                    cls: 'fa fa-exclamation-circle',
                    style: 'color: #F16152;font-size:32px;width:40px'
                }, {
                    xtype: 'label',
                    style: 'font-size:14px',
                    html: message
                }, {
                    xtype: 'button',
                    ui: 'hint',
                    html: '<span style="font-size: 16px">×</span>',
                    handler: function (btn) {
                        btn.up().hide();
                    }
                }],
                align: 't'
            });
        }
    }
});