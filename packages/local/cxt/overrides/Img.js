/**
 * Created by chenganbang on 2019/7/17.
 */
Ext.define('overrides.Img', {
    override: 'Ext.Img',

    requires: [
        'Ext.util.DelayedTask'
    ],

    /**
     * 是否启用遮罩
     */
    showLoadMaskOnInit: false,

    /**
     * 遮罩文字提示
     */
    loadingMessage: '正在加载...',

    /**
     * 延迟500ms，遮罩自动消失
     */
    maskDisappearDelay: 500,

    afterRender: function () {
        var me = this;
        if (me.showLoadMaskOnInit === true) {
            me.on('boxready', function () {
                me.loader = new Ext.LoadMask({
                    msg: me.loadingMessage,
                    target: me.ownerLayout.outerCt.el.component
                });
                me.loader.show();

                if (me.delayedTask) {
                    Ext.destroy(me.delayedTask);
                }

                me.delayedTask = new Ext.util.DelayedTask(function () {
                    if (me.loader) {
                        me.loader.destroy();
                    }
                }).delay(me.maskDisappearDelay);
            });
        }
        me.callParent(arguments);
    },

    destroy: function () {
        var me = this;
        if (me.delayedTask) {
            Ext.destroy(me.delayedTask);
        }
        me.callParent(arguments);
    }
});