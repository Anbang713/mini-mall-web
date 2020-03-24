// @define Ext.InputBox, Ext.Msg

/**
 * Utility class for generating different styles of message boxes.  The singleton instance, Ext.InputBox
 * alias `Ext.Msg` can also be used.
 *
 * Note that a InputBox is asynchronous.  Unlike a regular JavaScript `alert` (which will halt
 * browser execution), showing a InputBox will not cause the code to stop.  For this reason, if you have code
 * that should only run *after* some user feedback from the InputBox, you must use a callback function
 * (see the `function` parameter for {@link #method-show} for more details).
 *
 * Basic alert
 *
 *     @example
 *     Ext.Msg.alert('Status', 'Changes saved successfully.');
 *
 * Show a dialog using config options
 *
 *     @example
 *     Ext.Msg.show({
 *         title:'Save Changes?',
 *         message: 'You are closing a tab that has unsaved changes. Would you like to save your changes?',
 *         buttons: Ext.Msg.YESNOCANCEL,
 *         icon: Ext.Msg.QUESTION,
 *         fn: function(btn) {
 *             if (btn === 'yes') {
 *                 console.log('Yes pressed');
 *             } else if (btn === 'no') {
 *                 console.log('No pressed');
 *             } else {
 *                 console.log('Cancel pressed');
 *             } 
 *         }
 *     });
 *
 * Showing Ext.Msg while it's already shown will cause the visible instance to be
 * overwritten with the newly passed config.  While this may be the desired outcome, you
 * can also create a new InputBox that can exist alongside the Ext.Msg
 * singleton instance.
 *
 *     @example
 *     var myMsg = Ext.create('Ext.window.InputBox', {
 *         // set closeAction to 'destroy' if this instance is not
 *         // intended to be reused by the application
 *         closeAction: 'destroy'
 *     }).show({
 *         title: 'Custom InputBox Instance',
 *         message: 'I can exist along with Ext.Msg'
 *     });
 *
 *     Ext.Msg.alert('Overlapping', 'Ext.Msg instance');
 */
Ext.define('Cxt.window.InputBox', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.layout.container.HBox',
        'Ext.layout.container.VBox'
    ],

    alias: 'widget.inputbox',

    /**
     * @property
     * Button config that displays a single OK button
     */
    OK: 1,
    /**
     * @property
     * Button config that displays a single Yes button
     */
    YES: 2,
    /**
     * @property
     * Button config that displays a single No button
     */
    NO: 4,
    /**
     * @property
     * Button config that displays a single Cancel button
     */
    CANCEL: 8,
    /**
     * @property
     * Button config that displays OK and Cancel buttons
     */
    OKCANCEL: 9,
    /**
     * @property
     * Button config that displays Yes and No buttons
     */
    YESNO: 6,
    /**
     * @property
     * Button config that displays Yes, No and Cancel buttons
     */
    YESNOCANCEL: 14,
    /**
     * @property
     * The CSS class that provides the INFO icon image
     */
    INFO: Ext.baseCSSPrefix + 'message-box-info',
    /**
     * @property
     * The CSS class that provides the WARNING icon image
     */
    WARNING: Ext.baseCSSPrefix + 'message-box-warning',
    /**
     * @property
     * The CSS class that provides the QUESTION icon image
     */
    QUESTION: Ext.baseCSSPrefix + 'message-box-question',
    /**
     * @property
     * The CSS class that provides the ERROR icon image
     */
    ERROR: Ext.baseCSSPrefix + 'message-box-error',

    // hide it by offsets. Windows are hidden on render by default.
    hideMode: 'offsets',
    closeAction: 'hide',
    resizable: false,
    scrollable: true,
    title: '&#160;',

    defaultMinWidth: 250,
    defaultMaxWidth: 600,
    defaultMinHeight: 110,
    defaultMaxHeight: 500,

    // Forcibly set these to null on the prototype to override anything set higher in
    // the hierarchy
    minWidth: null,
    maxWidth: null,
    minHeight: null,
    maxHeight: null,
    constrain: true,

    cls: [Ext.baseCSSPrefix + 'message-box', Ext.baseCSSPrefix + 'hidden-offsets'],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    // We want to shrinkWrap around all docked items
    shrinkWrapDock: true,

    /**
     * @property
     * The minimum width in pixels of the message box if it is a prompt dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need.
     */
    minPromptWidth: 250,
    //<locale type="object">
    /**
     * @property
     * An object containing the default button text strings that can be overriden for localized language support.
     * Supported properties are: ok, cancel, yes and no.  Generally you should include a locale-specific
     * resource file for handling language support across the framework.
     * Customize the default text like so:
     *
     *     Ext.window.InputBox.buttonText.yes = "oui"; //french
     */
    buttonText: {
        ok: "确定",
        cancel: "取消",
        yes: "是",
        no: "否"
    },
    //</locale>

    buttonIds: [
        'ok', 'yes', 'no', 'cancel'
    ],

    //<locale type="object">
    titleText: {
        confirm: 'Confirm',
        prompt: 'Prompt'
    },
    //</locale>

    baseIconCls: Ext.baseCSSPrefix + 'message-box-icon',

    ariaRole: 'alertdialog',

    makeButton: function (btnIdx) {
        var btnId = this.buttonIds[btnIdx];
        return new Ext.button.Button({
            handler: this.btnCallback,
            itemId: btnId,
            scope: this,
            text: this.buttonText[btnId],
            minWidth: 75
        });
    },

    btnCallback: function (btn, event) {
        var me = this,
            value;

        // If this is caused by a keydown event (eg: SPACE on a Button), then the
        // hide will throw focus back to the previously focused element which will
        // then recieve an unexpected keyup event.
        // So defer callback handling until the upcoming keyup event.
        if (event && event.type === 'keydown' && !event.isSpecialKey()) {
            event.getTarget(null, null, true).on({
                keyup: function (e) {
                    me.btnCallback(btn, e);
                },
                single: true
            });
            return;
        }

        if (me.cfg.prompt) {
            value = me.editField.getValue();
            me.editField.setValue();
        }

        // Component.onHide blurs the active element if the Component contains the active element
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    },

    hide: function () {
        var me = this,
            cls = me.cfg ? me.cfg.cls : '';

        if (cls) {
            me.removeCls(cls);
        }
        me.callParent(arguments);
    },

    /**
     * @private
     */
    constructor: function (cfg) {
        var me = this;

        me.callParent(arguments);

        // set the default min/max/Width/Height to the initially configured min/max/Width/Height
        // so that it will be used as the default when reconfiguring.
        me.minWidth = me.defaultMinWidth = (me.minWidth || me.defaultMinWidth);
        me.maxWidth = me.defaultMaxWidth = (me.maxWidth || me.defaultMaxWidth);
        me.minHeight = me.defaultMinHeight = (me.minHeight || me.defaultMinHeight);
        me.maxHeight = me.defaultMaxHeight = (me.maxHeight || me.defaultMaxHeight);
    },

    initComponent: function (cfg) {
        var me = this,
            baseId = me.id,
            i, button;

        // A title or iconCls could have been passed in the config to the constructor.
        me.title = me.title || '&#160;';
        me.iconCls = me.iconCls || '';

        me.topContainer = new Ext.container.Container({
            layout: 'hbox',
            padding: 10,
            style: {
                overflow: 'hidden'
            },
            items: [
                me.iconComponent = new Ext.Component({
                    cls: me.baseIconCls
                }),
                me.promptContainer = new Ext.container.Container({
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        me.msg = new Ext.Component({
                            id: baseId + '-msg',
                            cls: me.baseCls + '-text'
                        }),
                        me.editField = new Ext.form.field.Text({
                            id: baseId + '-editField'
                        })
                    ]
                })
            ]
        });

        me.items = [me.topContainer];

        // Create the buttons based upon passed bitwise config
        me.msgButtons = [];
        for (i = 0; i < 4; i++) {
            button = me.makeButton(i);
            me.msgButtons[button.itemId] = button;
            me.msgButtons.push(button);
        }
        me.bottomTb = new Ext.toolbar.Toolbar({
            id: baseId + '-toolbar',
            ui: 'footer',
            dock: 'bottom',
            layout: {
                pack: 'center'
            },
            items: [
                me.msgButtons[0],
                me.msgButtons[1],
                me.msgButtons[2],
                me.msgButtons[3]
            ]
        });
        me.dockedItems = [me.bottomTb];
        me.on('close', me.onClose, me);
        me.callParent();
    },

    onClose: function () {
        var btn = this.header.child('[type=close]');

        if (btn) {
            // Give a temporary itemId so it can act like the cancel button
            btn.itemId = 'cancel';
            this.btnCallback(btn);
            delete btn.itemId;
        }
    },

    reconfigure: function (cfg) {
        var me = this,
            buttons = 0,
            hideToolbar = true,
            oldButtonText = me.buttonText,
            resizer = me.resizer,
            header = me.header,
            headerCfg = header && !header.isHeader,
            message = cfg && (cfg.message || cfg.msg),
            resizeTracker, width, height, i,
            editField, msg, msgButtons, tool;

        // Restore default buttonText before reconfiguring.
        me.updateButtonText();

        me.cfg = cfg = cfg || {};

        if (cfg.width) {
            width = cfg.width;
        }

        if (cfg.height) {
            height = cfg.height;
        }

        me.minWidth = cfg.minWidth || me.defaultMinWidth;
        me.maxWidth = cfg.maxWidth || me.defaultMaxWidth;
        me.minHeight = cfg.minHeight || me.defaultMinHeight;
        me.maxHeight = cfg.maxHeight || me.defaultMaxHeight;

        if (resizer) {
            resizeTracker = resizer.resizeTracker;
            resizer.minWidth = resizeTracker.minWidth = me.minWidth;
            resizer.maxWidth = resizeTracker.maxWidth = me.maxWidth;
            resizer.minHeight = resizeTracker.minHeight = me.minHeight;
            resizer.maxHeight = resizeTracker.maxHeight = me.maxHeight;
        }

        // Default to allowing the Window to take focus.
        delete me.defaultFocus;
        if (cfg.defaultFocus) {
            me.defaultFocus = cfg.defaultFocus;
        }

        // clear any old animateTarget
        me.animateTarget = cfg.animateTarget || undefined;

        // Defaults to modal
        me.modal = cfg.modal !== false;

        // Show the title/icon if a title/iconCls config was passed in the config to either the constructor
        // or the show() method. Note that anything passed in the config should win.
        //
        // Note that if there is no title/iconCls in the config, check the headerCfg and default to the instance
        // properties. This works because there are default values defined in initComponent.
        me.setTitle(cfg.title || (headerCfg && header.title) || me.title);
        me.setIconCls(cfg.iconCls || (headerCfg && header.iconCls) || me.iconCls);

        // Extract button configs
        if (Ext.isObject(cfg.buttons)) {
            me.buttonText = cfg.buttons;
            buttons = 0;
        } else {
            me.buttonText = cfg.buttonText || me.buttonText;
            buttons = Ext.isNumber(cfg.buttons) ? cfg.buttons : 0;
        }

        // Apply custom-configured buttonText
        // Infer additional buttons from the specified property names in the buttonText object
        buttons = buttons | me.updateButtonText();

        // Restore buttonText. Next run of reconfigure will restore to prototype's buttonText
        me.buttonText = oldButtonText;

        // During the on render, or size resetting layouts, and in subsequent hiding and showing, we need to
        // suspend layouts, and flush at the end when the Window's children are at their final visibility.
        Ext.suspendLayouts();
        me.width = me.height = null;
        if (width || height) {
            if (width) {
                me.setWidth(width);
            }

            if (height) {
                me.setHeight(height);
            }
        }
        me.hidden = false;
        if (!me.rendered) {
            me.render(Ext.getBody());
        }

        // Hide or show the close tool
        me.closable = cfg.closable !== false;

        // We need to redefine `header` because me.setIconCls() could create a Header instance.
        header = me.header;

        if (header) {
            tool = header.child('[type=close]');

            if (tool) {
                tool.setVisible(me.closable);
            }

            // Hide or show the header
            if (!cfg.title && !me.closable && !cfg.iconCls) {
                header.hide();
            } else {
                header.show();
            }
        }

        // Default to dynamic drag: drag the window, not a ghost
        me.liveDrag = !cfg.proxyDrag;

        // wrap the user callback
        me.userCallback = Ext.Function.bindCallback(cfg.callback || cfg.fn || Ext.emptyFn,
            cfg.scope || Ext.global);

        // Hide or show the icon Component
        me.setIcon(cfg.icon);

        // Hide or show the message area
        msg = me.msg;
        if (message) {
            msg.setHtml(message);
            msg.show();
        } else {
            msg.hide();
        }

        editField = me.editField;
        if (cfg.editor) {
            me.promptContainer.remove(me.editField);
            editField = me.editField = Ext.widget(cfg.editor);
            me.promptContainer.add(me.editField);
        }

        // Hide or show the input field
        if (cfg.prompt || editField) {
            editField.show();
            me.defaultFocus = editField;
        } else {
            editField.hide();
        }

        // Hide or show buttons depending on flag value sent.
        msgButtons = me.msgButtons;
        for (i = 0; i < 4; i++) {
            if (buttons & Math.pow(2, i)) {

                // Default to focus on the first visible button if focus not already set
                if (!me.defaultFocus) {
                    me.defaultFocus = msgButtons[i];
                }
                msgButtons[i].show();
                hideToolbar = false;
            } else {
                msgButtons[i].hide();
            }
        }

        // Hide toolbar if no buttons to show
        if (hideToolbar) {
            me.bottomTb.hide();
        } else {
            me.bottomTb.show();
        }
        Ext.resumeLayouts(true);
    },

    /**
     * @private
     * Set button text according to current buttonText property object
     * @return {Number} The buttons bitwise flag based upon the button IDs specified in the buttonText property.
     */
    updateButtonText: function () {
        var me = this,
            buttonText = me.buttonText,
            buttons = 0,
            btnId,
            btn;

        for (btnId in buttonText) {
            if (buttonText.hasOwnProperty(btnId)) {
                btn = me.msgButtons[btnId];
                if (btn) {
                    if (me.cfg && me.cfg.buttonText) {
                        buttons = buttons | Math.pow(2, Ext.Array.indexOf(me.buttonIds, btnId));
                    }
                    if (btn.text !== buttonText[btnId]) {
                        btn.setText(buttonText[btnId]);
                    }
                }
            }
        }
        return buttons;
    },

    /**
     * Displays a new message box, or reinitializes an existing message box, based on the config options passed in. All
     * display functions (e.g. prompt, alert, etc.) on InputBox call this function internally, although those calls
     * are basic shortcuts and do not support all of the config options allowed here.
     *
     * Example usage:
     *
     *     Ext.Msg.show({
     *         title: 'Address',
     *         message: 'Please enter your address:',
     *         width: 300,
     *         buttons: Ext.Msg.OKCANCEL,
     *         fn: saveAddress,
     *         animateTarget: 'addAddressBtn',
     *         icon: Ext.window.InputBox.INFO
     *     });
     *
     * @param {Object} config The following config options are supported:
     *
     * @param {String/Ext.dom.Element} config.animateTarget
     * An id or Element from which the message box should animate as it opens and closes.
     *
     * @param {Number} [config.buttons=false]
     * A bitwise button specifier consisting of the sum of any of the following constants:
     *
     *  - Ext.InputBox.OK
     *  - Ext.InputBox.YES
     *  - Ext.InputBox.NO
     *  - Ext.InputBox.CANCEL
     *
     * Some common combinations have already been predefined:
     *
     *  - Ext.InputBox.OKCANCEL
     *  - Ext.InputBox.YESNO
     *  - Ext.InputBox.YESNOCANCEL
     *
     * Or false to not show any buttons.
     *
     * This may also be specified as an object hash containing custom button text in the same format as the
     * {@link #buttonText} config. Button IDs present as property names will be made visible.
     *
     * @param {Boolean} config.closable
     *
     * @param {String} config.cls
     * A custom CSS class to apply to the message box's container element
     *
     * @param {Function} config.fn
     * A callback function which is called when the dialog is dismissed either by clicking on the configured buttons, or
     * on the dialog close button, or by pressing the return button to enter input.
     *
     *  @param {String} config.fn.buttonId The ID of the button pressed, one of:
     *
     * - ok
     * - yes
     * - no
     * - cancel
     *
     *  @param {Object} config.fn.opt The config object passed to show.
     *
     * @param {Object} config.buttonText
     * An object containing string properties which override the system-supplied button text values just for this
     * invocation. The property names are:
     *
     * - ok
     * - yes
     * - no
     * - cancel
     *
     * @param {Object} config.scope
     * The scope (`this` reference) in which the function will be executed.
     *
     * @param {String} config.icon
     * A CSS class that provides a background image to be used as the body icon for the dialog.
     * One can use a predefined icon class:
     *
     *  - Ext.InputBox.INFO
     *  - Ext.InputBox.WARNING
     *  - Ext.InputBox.QUESTION
     *  - Ext.InputBox.ERROR
     *
     * or use just any `'custom-class'`. Defaults to empty string.
     *
     * @param {String} config.iconCls
     * The standard {@link Ext.window.Window#iconCls} to add an optional header icon (defaults to '')
     *
     * @param {String} config.defaultFocus
     * The button to focus when showing the dialog. If not specified, defaults to
     * the first visible button.
     *
     * @param {Number} config.maxWidth
     * The maximum width in pixels of the message box (defaults to 600)
     *
     * @param {Number} config.minWidth
     * The minimum width in pixels of the message box (defaults to 100)
     *
     * @param {Boolean} config.modal
     * False to allow user interaction with the page while the message box is displayed (defaults to true)
     *
     * @param {String} config.message
     * A string that will replace the existing message box body text (defaults to the XHTML-compliant non-breaking space
     * character '&#160;')
     *
     * @param {Boolean} config.prompt
     * True to prompt the user to enter single-line text (defaults to false)
     *
     * @param {Boolean} config.proxyDrag
     * True to display a lightweight proxy while dragging (defaults to false)
     *
     * @param {String} config.title
     * The title text
     *
     * @param {String} config.value
     * The string value to set into the active textbox element if displayed
     *
     * @param {Number} config.width
     * The width of the dialog in pixels
     *
     * @return {Ext.window.InputBox} this
     */
    show: function (config) {
        var me = this;
        config = config || {};

        // If called during global layout suspension, make the call after layout resumption
        if (Ext.Component.layoutSuspendCount) {
            Ext.on({
                resumelayouts: function () {
                    me.show(config);
                },
                single: true
            });
            return me;
        }

        me.reconfigure(config);
        if (config.cls) {
            me.addCls(config.cls);
        }

        // Set the flag, so that the parent show method performs the show procedure that we need.
        me.hidden = true;
        me.callParent();
        return me;
    },

    onShow: function () {
        this.callParent(arguments);
        this.center();
    },

    /**
     * Adds the specified icon to the dialog.  By default, the class 'x-messagebox-icon' is applied for default
     * styling, and the class passed in is expected to supply the background image url. Pass in empty string ('')
     * to clear any existing icon. This method must be called before the InputBox is shown.
     * The following built-in icon classes are supported, but you can also pass in a custom class name:
     *
     *     Ext.window.InputBox.INFO
     *     Ext.window.InputBox.WARNING
     *     Ext.window.InputBox.QUESTION
     *     Ext.window.InputBox.ERROR
     *
     * @param {String} icon A CSS classname specifying the icon's background image url, or empty string to clear the icon
     * @param {Number} [width] The width of the icon. If not specified, the default is used
     * @param {Number} [height] The height of the icon. If not specified, the default is used
     * @return {Ext.window.InputBox} this
     */
    setIcon: function (icon, width, height) {
        var me = this,
            iconCmp = me.iconComponent,
            cls = me.messageIconCls;

        if (cls) {
            iconCmp.removeCls(cls);
        }

        if (icon) {
            iconCmp.show();
            if (width || height) {
                iconCmp.setSize(width || iconCmp.getWidth(), height || iconCmp.getHeight());
            }
            iconCmp.addCls(Ext.baseCSSPrefix + 'dlg-icon');
            iconCmp.addCls(me.messageIconCls = icon);
        } else {
            iconCmp.removeCls(Ext.baseCSSPrefix + 'dlg-icon');
            iconCmp.hide();
        }
        return me;
    },

    onEsc: function () {
        if (this.closable !== false) {
            this.callParent(arguments);
        }
    },

    /**
     * Displays a confirmation message box with Yes and No buttons (comparable to JavaScript's confirm).
     * If a callback function is passed it will be called after the user clicks either button,
     * and the id of the button that was clicked will be passed as the only parameter to the callback
     * (could also be the top-right close button, which will always report as "cancel").
     *
     * @param {String} title The title bar text
     * @param {String} message The message box body text
     * @param {Function} [fn] The callback function invoked after the message box is closed.
     * See {@link #method-show} method for details.
     * @param {Object} [scope=window] The scope (`this` reference) in which the callback is executed.
     * @return {Ext.window.InputBox} this
     */
    confirm: function (cfg, message, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                icon: this.QUESTION,
                message: message,
                buttons: this.YESNO,
                callback: fn,
                scope: scope
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with OK and Cancel buttons prompting the user to enter some text (comparable to JavaScript's prompt).
     * The prompt can be a single-line or multi-line textbox.  If a callback function is passed it will be called after the user
     * clicks either button, and the id of the button that was clicked (could also be the top-right
     * close button, which will always report as "cancel") and the text that was entered will be passed as the two parameters to the callback.
     *
     * @param {String} title The title bar text
     * @param {String} message The message box body text
     * @param {Object} editor 编辑控件
     * @param {Function} [fn] The callback function invoked after the message box is closed.
     * See {@link #method-show} method for details.
     * @param {Object} [scope=window] The scope (`this` reference) in which the callback is executed.
     * property, or the height in pixels to create the textbox/
     * @return {Ext.window.InputBox} this
     */
    prompt: function (title, message, editor, fn, scope) {
        if (Ext.isString(title)) {
            title = {
                prompt: true,
                title: title,
                minWidth: this.minPromptWidth,
                message: message,
                buttons: this.OKCANCEL,
                callback: fn,
                scope: scope,
                editor: editor
            };
        }
        return this.show(title);
    }
}, function (InputBox) {
    /**
     * @class Ext.InputBox
     * @alternateClassName Ext.Msg
     * @extends Ext.window.InputBox
     * @singleton
     * @inheritdoc Ext.window.InputBox
     */
    // We want to defer creating Ext.InputBox and Ext.Msg instances
    // until overrides have been applied.
    Ext.onInternalReady(function () {
        Ext.InputBox = new InputBox();
    });
});