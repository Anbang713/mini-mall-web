/**
 * 批处理器，确认后自动销毁
 * Created by Leo on 2016/5/5.
 */
Ext.define('Cxt.window.BatchProcessor', {
    extend: 'Ext.window.Window',
    alias: 'widget.batchprocessor',

    requires: [
        'Cxt.util.LoadMask',
        'Cxt.util.Toast',
        'Ext.button.Button',
        'Ext.form.Label',
        'Ext.layout.container.Fit',
        'Ext.layout.container.VBox',
        'Ext.panel.Panel',
        'Ext.toolbar.Fill',
        'Ext.util.Format',
        'Ext.window.Window'
    ],

    header: false,// 不显示标题
    width: 300, // 宽度
    layout: 'vbox',// 默认布局，使用者不应该修改
    closable: false,// 不显示关闭按钮

    modal: true,

    processing: false,    //是否处理中
    //处理数据
    records: [],

    needStop: false, //错误后是否停止

    /**
     * @cfg {String/Ext.XTemplate} tipTpl
     * The {@link Ext.XTemplate XTemplate} 报错提示的显示格式
     */
    labelTpl: undefined,

    /**
     * @cfg {String} actionText
     * 动作名称，提示用
     */

    /**
     * @cfg {Object[]} records
     * 批处理执行处理的数据集
     */

    /**
     * @cfg {Function/String} executeFn
     * 执行数据处理的函数
     */
    executeFn: Ext.emptyFn,

    /**
     * @cfg {boolean} needConfirm
     * 是否由处理器进行确认处理。
     * Defaults to: true
     */
    needConfirm: true,

    /**
     * @cfg {boolean} emptyAlert
     * 数据为空时是否
     * Defaults to: true
     */
    emptyAlert: true,

    /**
     * @event complete
     * 完成动作确定后会触发
     * @param {Cxt.BatchProcessor} this
     */

    /**
     * @event interrupt
     * 中断动作确定后会触发
     * @param {Cxt.BatchProcessor} this
     */

    /**
     *初始化
     */
    initComponent: function () {
        var me = this;
        me.items = [{
            xtype: 'label',
            itemId: 'label',
            margin: 25,
            style: {
                fontWeight: 'bold'
            }
        }, {
            xtype: "progressbar",
            margin: 25,
            itemId: "progressbar",
            border: true,
            width: "100%"
        }, {
            xtype: "toolbar",
            width: '100%',
            items: ['->', {
                xtype: "button",
                margin: 25,
                width: 100,
                text: '中断',
                listeners: {
                    click: function () {
                        me.interrupted = true;
                        Ext.Msg.confirm('提示', "是否中断当前操作？", function (success) {
                            if (success == 'yes') {
                                me.interrupted = true;
                                me.complete();
                            } else {
                                me.interrupted = false;
                                me.next();
                            }
                        });
                    }, scope: me
                }
            }, '->']
        }];
        if (!me.labelTpl) {
            me.labelTpl = '{summary}';
        }
        if (!me.labelTpl.isTemplate) {
            me.labelTpl = this.getTpl('labelTpl');
        }

        me.callParent(arguments);
    },

    /**
     * 批处理数据
     */
    batchProcess: function () {
        var me = this;
        if ((!me.records || me.records.length == 0)) {
            if (!!me.emptyAlert) {
                return Cxt.util.Toast.warning("请先选择需要" + me.actionText + "的记录！");
            }
            return;
        }

        if (!!me.needConfirm) {
            var tipMsg = "是否要" + me.actionText + "当前选中的记录（共计 " + me.records.length + " 个）？";
            if (Ext.isEmpty(me.customTipMsg) == false) {
                tipMsg = me.customTipMsg;
            }
            Ext.Msg.confirm('提示', tipMsg,
                function (success) {
                    if (success == 'yes') {
                        me.start();
                    }
                });
        } else {
            me.start();
        }
    },
    /**
     * 启动批处理器
     */
    start: function () {
        var me = this;

        if (!me.records || me.records.length == 0) {
            return;
        }
        // 开始计数
        me.recordIndex = 0;

        //初始化操作
        Ext.apply(me, {
            processing: true,
            report: {
                total: me.records.length,// 总记录数
                success: 0,// 成功数
                skipped: 0,// 忽略数
                failureResult: []//失败单据及原因
            }
        });

        me.show();
        me.process();
    },

    /**
     * 处理一条数据
     */
    process: function () {
        var me = this,
            recordIndex = me.recordIndex;

        if (recordIndex >= me.records.length) {
            if (me.isVisible()) {
                me.hide();
            }
            me.processing = false;
            me.complete();
            return;
        }

        var record = me.records[recordIndex];
        if (!record) { // 处理数据为空的时候，跳过，并开始执行下一个
            me.skip();
            return;
        }

        me.down("#progressbar").updateProgress(recordIndex / me.records.length, "");
        me.down('#label').setText('批量' + me.actionText + '进度：' + recordIndex + '/' + me.records.length);

        // 已经有遮罩了。在执行服务的时候就不需要再出现遮罩了
        Cxt.util.LoadMask.disable();
        me.executeFn(record, {
            onFailure: function (response) {
                me.report.failureResult.push({
                    summary: Ext.isEmpty(me.labelTpl.apply(record)) ? '出错原因' : me.labelTpl.apply(record),
                    reason: !!response.responseText ? response.responseText : "未知"
                });
                if (me.needStop) {
                    me.interrupted = true;
                    me.complete();
                    return;
                } else {
                    me.next();
                }
            },
            onSuccess: function () {
                me.report.success++;
                me.next();
            },
            onSkip: function () {
                me.skip();
            }
        });
        Cxt.util.LoadMask.enable();
    },

    /**
     * 处理下一条数据
     */
    next: function () {
        var me = this;
        if (me.interrupted)
            return;
        me.recordIndex++;
        me.process();
    },

    /**
     * 跳过当前记录的处理，并开始执行下一个
     */
    skip: function () {
        var me = this;
        me.report.skipped++;

        me.next();
    },

    /**
     * 处理结束时调用
     */
    complete: function () {
        var me = this;
        var result = '批量处理' + me.actionText + '完成。';
        result += me.getReporter();
        var msgbox = Ext.create('Ext.window.Window', {
            title: "执行结果",
            layout: 'fit',
            modal: true,
            buttonAlign: "center",
            resizable: false,
            closable: false,// 不显示关闭按钮
            belongTo: me.belongTo,
            items: [{
                xtype: 'panel',
                border: false,
                margin: 10,
                items: [{
                    margin: 10,
                    html: result
                }, me.report.failureResult.length == 0 ? null : me.createFailureReport()]
            }],
            buttons: [{
                xtype: "button",
                text: "关闭",
                handler: function () {
                    msgbox.hide();
                    //在跳出执行结果前 进行完成回调函数
                    me.fireEvent('complete', me);
                    me.destroy();
                }
            }]
        });
        msgbox.show();
    },

    /**
     * 获取执行结果报告
     * @returns {*}
     */
    getReporter: function () {
        var me = this;
        if (me.report.total == me.report.success) {
            return me.report.total + "个全部处理成功";
        } else {
            var result = "";
            result += "<br>";
            result += "共有" + me.report.total + "个,其中：";
            result += "成功" + me.report.success + "个";
            if (me.report.skipped > 0) {
                result += "，跳过" + me.report.skipped + "个";
            }

            var notProcessed = me.report.total - me.report.success - me.report.failureResult.length - me.report.skipped;
            if (notProcessed > 0) {
                result += "，未处理" + notProcessed + "个";
            }

            if (me.report.failureResult.length > 0) {
                result += "，失败" + me.report.failureResult.length + "个";
            }
            result += "</br>";
            return result;
        }
    },


    /**
     * 创建失败信息提示面板
     * @returns {*}
     */
    createFailureReport: function () {
        var me = this;
        if (me.report.failureResult.length >= 0) {
            return Ext.create("Ext.panel.Panel", {
                border: true,
                bodyPadding: 10,
                minWidth: 300,
                maxWidth: 600,
                maxHeight: 400,
                autoScroll: true,
                scrollable: true,
                html: Ext.util.Format.list(me.report.failureResult, '<br>', '<b>{summary}：</b>{reason}')
            });
        }
        return null;
    }
});