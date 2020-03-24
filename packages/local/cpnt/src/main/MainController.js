/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Cpnt.main.MainController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Cxt.util.LoadMask',
        'Cxt.util.Window',
        'Ext.util.Format'
    ],

    routes: {
        ':name': {
            action: 'showView',
            conditions: {
                ':name': '([0-9a-zA-Z\u4e00-\u9fa5\;\.\&\?\=\_\%\-]+)'
            }
        }
    },

    showView: function (name) {
        console.log(new Date(), '进入模块');
        var me = this,
            mainView = me.getView(),
            moduleId = name,
            index = name.indexOf('?');
        if (name === 'catalog') {
            mainView.removeAll();
            mainView.add({
                xtype: name
            });
            return;
        }

        me.entryTime = new Date();
        if (index > 0) {
            moduleId = name.substring(0, index);
        }
        var urlParams = Cxt.util.Window.parseParams(name);
        console.log(new Date(), 'urlParams', urlParams);

        if (!urlParams['jsessionid']) {
            return Cxt.util.Window.navigate(window.location.href, {
                jsessionid: Ext.util.Format.date(new Date(), 'YmdHisu')
            });
        }
        try {
            Cxt.util.LoadMask.initMark(me.getView());

            var module = Ext.syncRequire(Ext.ClassManager.getNameByAlias(moduleId));
            if (Ext.isEmpty(module)) {
                Ext.raise("You must specify a module config.");
            }
            if (Ext.isEmpty(module.moduleId)) {
                Ext.raise("You must specify a moduleId config.");
            }

            console.log(new Date(), '读取模块配置：' + module.moduleCaption + '，用时：' + (new Date() - me.entryTime));
            Cxt.util.Window.setTitle(module.moduleCaption);
            me.switchView(module, urlParams, {});
        } catch (e) {
            mainView.setHtml("不正确的路由" + name + ":" + e);
        }
    },

    switchView: function (module, urlParams, moduleContext) {
        var me = this,
            mainView = me.getView(),
            node = urlParams['node'],
            xtype = module.moduleId + '.' + node;

        if (Ext.MessageBox.windowsManagers) {
            Ext.Array.each(Ext.MessageBox.windowsManagers, function (window) {
                try {
                    window.close();
                } catch (e) {
                    Ext.Logger.warn(e);
                }
            });
            Ext.MessageBox.windowsManagers.length = 0;
        }

        mainView.removeAll();

        var cmp = Ext.create({
            xtype: xtype,
            module: module,
            moduleContext: moduleContext,
            urlParams: urlParams
        });
        mainView.add(cmp);

        console.log(new Date(), '构建界面用时：' + (new Date() - me.entryTime));
        if (Ext.isFunction(cmp.onRefresh)) {
            cmp.onRefresh(urlParams);
        }
        if (Ext.isFunction(cmp.afterRefresh)) {
            cmp.afterRefresh();
        }
        console.log(new Date(), '界面刷新用时：' + (new Date() - me.entryTime));
    }
});
