/**
 * Created by cRazy on 2017/6/12.
 */
Ext.define('Cxt.panel.cron.Expression', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cron.expression',

    requires: [
        'Cxt.data.cron.Cron',
        'Ext.button.Button',
        'Ext.form.field.Text',
        'Ext.panel.Panel'
    ],

    
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                xtype: 'textfield',
                fieldCaption: '表达式',
                allowBlank: false,
                columnWidth: 1,
                bind: '{cron}',
                validator: function (value) {
                    if (this.isBlankValue()) {
                        return true;
                    }
                    try {
                        new Cxt.data.cron.Cron(value);
                        return true;
                    } catch (e) {
                        return e;
                    }
                }
            }, {
                xtype: 'panel',
                columnWidth: 1,
                collapsed: true,
                maxHeight: 300,
                scrollable: {
                    x: false,
                    y: true
                },
                tools: [{
                    xtype: 'button',
                    text: '使用帮助>>',
                    ui: 'link',
                    handler: function (btn) {
                        var panel = btn.ownerCt.ownerCt;
                        btn.setText(panel.collapsed ? '<< 使用帮助' : '使用帮助 >>');
                        panel[panel.collapsed ? 'expand' : 'collapse']();
                    }
                }],
                html: '<span>Cron表达式是一个字符串，字符串以5或6个空格隔开，分为6或7个域，每一个域代表一个含义，Cron有如下两种语法格式： </span><br>'
                + '<span>Seconds Minutes Hours DayOfMonth Month DayOfWeek Year 或</span><br>'
                + '<span>Seconds Minutes Hours DayOfMonth Month DayOfWeek</span><br>'
                + '<b>本系统默认采用第二种格式</b><br>'
                + '<span>每一个域可出现的字符如下： </span><br>'
                + '<ul><li><b>Seconds</b>：可出现", - * /"四个字符，有效范围为0-59的整数</li>'
                + '<li><b>Minutes</b>：可出现", - * /"四个字符，有效范围为0-59的整数</li>'
                + '<li><b>Hours</b>：可出现", - * /"四个字符，有效范围为0-23的整数</li>'
                + '<li><b>DayOfMonth</b>：可出现", - * / ? L W C"八个字符，有效范围为0-31的整数</li>'
                + '<li><b>Month</b>：可出现", - * /"四个字符，有效范围为1-12的整数或JAN-DEC</li>'
                + '<li><b>DayOfWeek</b>：可出现", - * / ? L C #"四个字符，有效范围为1-7的整数或SUN-SAT两个范围。1表示星期天，2表示星期一， 依次类推</li>'
                + '<li><b>Year</b>：可出现", - * /"四个字符，有效范围为1970-2099年</li></ul>'
                + '<span>每一个域都使用数字，但还可以出现如下特殊字符，它们的含义是： </span>'
                + '<ul><li><b>*</b>：表示匹配该域的任意值，假如在Minutes域使用*, 即表示每分钟都会触发事件。</li>'
                + '<li><b>?</b>：只能用在DayOfMonth和DayOfWeek两个域。它也匹配域的任意值，但实际不会。因为DayOfMonth和DayOfWeek会相互影响。例如想在每月的20日触发调度，不管20日到底是星期几，则只能使用如下写法： 13 13 15 20 * ?, 其中最后一位只能用？，而不能使用*，如果使用*表示不管星期几都会触发，实际上并不是这样。</li>'
                + '<li><b>-</b>：表示范围，例如在Minutes域使用5-20，表示从5分到20分钟每分钟触发一次</li>'
                + '<li><b>/</b>：表示起始时间开始触发，然后每隔固定时间触发一次，例如在Minutes域使用5/20,则意味着5分钟触发一次，而25，45等分别触发一次</li>'
                + '<li><b>,</b>：表示列出枚举值值。例如：在Minutes域使用5,20，则意味着在5和20分每分钟触发一次。</li>'
                + '<li><b>L</b>：表示最后，只能出现在DayOfWeek和DayOfMonth域，如果在DayOfWeek域使用5L,意味着在最后的一个星期四触发。</li>'
                + '<li><b>W</b>：表示有效工作日(周一到周五),只能出现在DayOfMonth域，系统将在离指定日期的最近的有效工作日触发事件。例如：在 DayOfMonth使用5W，如果5日是星期六，则将在最近的工作日：星期五，即4日触发。如果5日是星期天，则在6日(周一)触发；如果5日在星期一到星期五中的一天，则就在5日触发。另外一点，W的最近寻找不会跨过月份 </li>'
                + '<li><b>LW</b>：这两个字符可以连用，表示在某个月最后一个工作日，即最后一个星期五。</li>'
                + '<li><b>#</b>：用于确定每个月第几个星期几，只能出现在DayOfMonth域。例如在4#2，表示某月的第二个星期三。</li></ul>'
            }]
        });
        me.callParent(arguments);
    },

    getValue: function () {
        var me = this;
        return me.getViewModel().get('cron');
    }

});