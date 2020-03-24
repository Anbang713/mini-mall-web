/**
 * Created by cRazy on 2016/11/4.
 */
Ext.define('overrides.button.Button', {
    override: 'Ext.button.Button',

    requires: [
        'Ext.button.Manager'
    ],

    config: {

        /**
         * 当revoke = true时，不触发点击事件。
         * 按钮连续点击后，可能多次触发click实际当遇到该场景时，可以设置revoke = true。
         * 不过在增加了doubleClickDelay的属性之后。revoke的存在已经基本无利用价值。
         */
        revoke: false
    },

    /**
     * 按钮的双击事件？大约是不需要的
     * 记录每次点击的时间戳，两次点击时间的最小触发间隔为 doubleClickDelay
     * 默认500ms
     * 通过这样的方式，来避免对按钮的快速点击造成的事件多次触发
     */
    doubleClickDelay: 500,

    /**
     * @cfg {String/String[]} hiddenConfig
     * 某些时候，对于隐藏的控制变量较多。不方便直接控制hidden。
     * 若配置了hiddenConfig。则会自动创建set方法。对于每个属性只要存在true，则隐藏。
     * 注意不要与ext方法名重复。
     */
    hiddenConfig: undefined,

    /**
     * 鼠标点击的时候加pressed样式。
     * 目前在自定义属性的配置面板中，作为标签的属性按钮设置为false，避免按住拖拽的时候，出现pressed样式。
     * 不过其实也可以通过直接修改_pressedCls的方法来打成这个目的。
     */
    pressedOnMouseDown: true,

    _revokeCls: Ext.baseCSSPrefix + 'btn-revoke',

    initComponent: function () {
        var me = this;

        me.initHiddenConfig();
        // WAI-ARIA spec requires that menu buttons react to Space and Enter keys
        // by showing the menu while leaving focus on the button, and to Down Arrow key
        // by showing the menu and selecting first menu item. This behavior may conflict
        // with historical Ext JS menu button behavior if a handler or a click listener
        // is set on a button; in that case Space or Enter key would activate
        // the handler/click listener, and only Down Arrow key would open the menu.
        // To avoid the ambiguity, we check if the button has both menu *and* handler
        // or click event listener, and warn the developer in that case.
        //<debug>
        // Don't check if we're under the slicer to avoid build failures
        if (me.menu && Ext.enableAriaButtons && !Ext.slicer) {
            // When ARIA compatibility is enabled, force an error here.
            var logFn = Ext.enableAria ? Ext.log.error : Ext.log.warn;

            if (me.enableToggle || me.toggleGroup) {
                logFn(
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' behavior will conflict with " +
                    "toggling."
                );
            }

            if (me.href) {
                logFn(
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' cannot behave as a link."
                );
            }

            // 增加了handler与menu的冲突判断。当button属于split类型的时候，该冲突是合理的。
            if (me.split == false && (me.handler || me.hasListeners.click)) {
                logFn(
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' should display the menu " +
                    "on SPACE and ENTER keys, which will conflict with the " +
                    "button handler."
                );
            }
        }
        //</debug>

        // Ensure no selection happens
        me.addCls(Ext.baseCSSPrefix + 'unselectable');

        // 跳过父类调用超类
        me.callSuper(arguments);

        if (me.menu) {
            // Flag that we'll have a splitCls
            me.split = true;
            me.setMenu(me.menu, /*destroyMenu*/false, true);
        }

        // Accept url as a synonym for href
        if (me.url) {
            me.href = me.url;
        }

        // preventDefault defaults to false for links
        me.configuredWithPreventDefault = me.hasOwnProperty('preventDefault');
        if (me.href && !me.configuredWithPreventDefault) {
            me.preventDefault = false;
        }

        if (Ext.isString(me.toggleGroup) && me.toggleGroup !== '') {
            me.enableToggle = true;
        }

        if (me.html && !me.text) {
            me.text = me.html;
            delete me.html;
        }
    },

    initHiddenConfig: function () {
        var me = this;
        me.hiddenConfig = Ext.Array.from(me.hiddenConfig);

        if (me.hiddenConfig.length == 0)
            return;
        me.hiddenManager = {};

        Ext.Array.each(me.hiddenConfig, function (config) {
            var capitalizedName = config.charAt(0).toUpperCase() + config.substr(1);
            me['get' + capitalizedName] = function () {
                return me.hiddenManager[config];
            };

            me['set' + capitalizedName] = function (value) {
                me.hiddenManager[config] = value;
                me[value ? 'hide' : 'show']();
            }
        });
    },

    show: function () {
        var me = this,
            visible = true;

        Ext.Array.findBy(me.hiddenConfig, function (config) {
            var capitalizedName = config.charAt(0).toUpperCase() + config.substr(1);
            return visible = me['get' + capitalizedName]() !== true;
        });
        if (visible) {
            me.callParent(arguments);
        } else {
            me.hide();
        }
    },

    /**
     * @private
     */
    onClick: function (e) {
        var me = this,
            timeStamp = new Date().getTime();
        me.doPreventDefault(e);

        if (me.timeStamp && timeStamp - me.timeStamp < me.doubleClickDelay)
            return;
        me.timeStamp = timeStamp;
        // Can be triggered by ENTER or SPACE keydown events which set the button property.
        // Only veto event handling if it's a mouse event with an alternative button.
        // Checking e.button for a truthy value (instead of != 0) also allows touch events
        // (tap) to continue, as they do not have a button property defined.
        if (e.type !== 'keydown' && e.button) {
            return;
        }

        if (!(me.disabled || me.revoke === true)) {
            me.doToggle();
            me.maybeShowMenu(e);
            me.fireHandler(e);
        }
    },

    doPreventDefault: function (e) {
        // 对于revoke的处理。
        if (e && (this.preventDefault || (this.disabled && this.getHref())) || this.revoke === true) {
            e.preventDefault();
        }
    },

    /**
     * 当revoke = true时，不触发点击事件。
     * 按钮连续点击后，可能多次触发click实际当遇到该场景时，可以设置revoke = true。
     */
    setRevoke: function (revoke) {
        var me = this,
            revokeCls = me._revokeCls;
        me.revoke = revoke;
        me[revoke ? 'addCls' : 'removeCls'](revokeCls);
    },

    /**
     * @private
     */
    onMouseDown: function (e) {
        var me = this;
        if (Ext.isIE || e.pointerType === 'touch') {
            // In IE the use of unselectable on the button's elements causes the element
            // to not receive focus, even when it is directly clicked.
            // On Touch devices, we need to explicitly focus on touchstart.
            Ext.defer(function () {
                var focusEl = me.getFocusEl();
                // Deferred to give other mousedown handlers the chance to preventDefault
                if (focusEl && !e.defaultPrevented) {
                    focusEl.focus();
                }
            }, 1);
        }
        if (!me.disabled && e.button === 0 && me.pressedOnMouseDown) {
            Ext.button.Manager.onButtonMousedown(me, e);
            me.addCls(me._pressedCls);
        }
    },

    /**
     * @private
     */
    onMouseUp: function (e) {
        var me = this;
        // If the external mouseup listener of the ButtonManager fires after the button has been destroyed, ignore.
        if (!me.destroyed && e.button === 0 && me.pressedOnMouseDown) {
            if (!me.pressed) {
                me.removeCls(me._pressedCls);
            }
        }
    }
});