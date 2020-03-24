/**
 * 模块上下文管理器，由MainController负责注入
 * Created by cRazy on 2016/6/17.
 */
Ext.define('Cxt.util.ModuleContext', function () {
    var me; // holds our singleton instance

    return {
        singleton: true,

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },
        /** 模块操作上下文*/
        moduleContexts: {},

        setModuleContext: function (moduleId, moduleContext) {
            var me = this;
            me.moduleContexts[moduleId] = moduleContext;
        },

        getModuleContext: function (moduleId) {
            var me = this;
            return me.moduleContexts[moduleId];
        },

        getModuleContextValue: function (moduleId, key) {
            var me = this,
                moduleContext = me.moduleContexts[moduleId];
            return !!moduleContext ? moduleContext[key] : undefined;
        },

        setModuleContextValue: function (moduleId, key, value) {
            var me = this,
                moduleContext = me.moduleContexts[moduleId];
            if (!!moduleContext) {
                moduleContext[key] = value;
            }
        },

        getDefaultStore: function (moduleId) {
            var me = this,
                moduleContext = me.moduleContexts[moduleId];
            return !!moduleContext ? moduleContext['defaultStore'] : undefined;
        }
    }
});