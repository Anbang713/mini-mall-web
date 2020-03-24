/**
 * Created by cRazy on 2016/7/2.
 */
Ext.define('Cpnt.log.OperateLogTrace', {
    extend: 'Cxt.panel.LogTrace',
    alias: 'widget.operatelog',

    /**
     * @cfg {String} style
     * 审计日志默认白色背景
     */
    bodyStyle: "background-color:#FFFFFF",

    /**
     * @cfg {String} lineHeight
     * 审计日志行高调整为30
     */
    lineHeight: 30,
    highlightColor: '#333',

    normalColor: '#999',

    autoScroll: true, //日志面板设置下拉滚动条

    /**
     * @cfg {String} logTpl
     * 用于显示日志的tpl
     */
    logTpl: '{operator.displayName}[{operator.loginName}] {actionName}于 {time}',

    /**
     * @cfg {String} objectId
     * 审计日志objectId，设置之后会自动加载其日志列表
     */

    /**
     * @cfg {String} servicePath
     * 审计日志服务加载地址。
     */
    serviceUrl: 'api/basis/operationlog/',

    config: {
        objectId: undefined
    },

    /**
     * @return {String} objectId
     */
    getObjectId: function () {
        var me = this;
        return me.objectId;
    },

    /**
     * @param {String} objectId 通常是对象uuid
     */
    setObjectId: function (objectId) {
        var me = this;
        me.objectId = objectId;
        me.loadAuditLogs();
    },

    loadAuditLogs: function () {
        var me = this;

        if (Ext.isEmpty(me.objectId)) {
            return;
        }

        me.showLoading();
        Ext.Ajax.request({
            url: me.serviceUrl + me.objectId,
            method: 'GET',
            failureToast: true,
            success: function (response) {
                me.logs = Ext.JSON.decode(response.responseText, true);
                me.redraw();
                me.hideLoading();
            }
        })
    },

    afterLayout: function (layout) {
        var me = this;
        me.callParent(arguments);
        if (me.rendered && me.logs) {
            me.redraw();
        }
    },

    /** 重画*/
    redraw: function () {
        var me = this,
            logs = me.logs,
            logTpl = me.logTpl;

        if (logs.length == 0) {
            logTpl = '{text}';
            logs = [{
                text: '未取得操作记录'
            }];
        }

        me.setValue({
            data: logs,
            tpl: logTpl,
            hilight: 0
        });
    },

    /**指定作为关键信息的日志序号，默认为3*/
    keyInfoNumber: 3,
    /**日志关键信息，指定将该值作为关键信息，没有该值则返回“未记录”,可以通过覆盖“logTpl”使用该值，
     * 如果使用者需要在日志显示中追加关键信息显示，可以指定item的number=keyInfoNumber，具体参见auditEvent。
     */
    getAuditEventKeyInfo: function (auditEvent) {
        var me = this;
        var keywords = auditEvent.keywords;
        if (Ext.isEmpty(keywords.items)) {
            return '未记录';
        }

        var value = '未记录';
        Ext.Array.each(keywords.items, function (item) {
            if (me.keyInfoNumber == item.number) {
                value = item.value;
            }
        });

        return value;
    },


    destroy: function () {
        var me = this;
        delete me.logs;
        me.callParent(arguments);
    }
});