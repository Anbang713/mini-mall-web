/**
 * Created by cRazy on 2016/9/7.
 */
Ext.define('overrides.tab.Panel', {
    override: 'Ext.tab.Panel',

    requires: [
        'Ext.container.Container',
        'Ext.form.CheckboxGroup',
        'Ext.form.field.Base'
    ],

    errorPrefixing: true,

    setActiveTab: function (card) {
        var me = this,
            previous;

        if (me.destroyed)
            return;
        // Check for a config object
        if (!Ext.isObject(card) || card.isComponent) {
            card = me.getComponent(card);
        }
        previous = me.getActiveTab();
        if (card) {
            // We may be passed a config object, so add it.
            // Without doing a layout!
            if (!card.isComponent) {
                Ext.suspendLayouts();
                card = me.add(card);

                if (previous === card || me.fireEvent('beforetabchange', me, card, previous) === false) {
                    Ext.resumeLayouts(true);
                    return previous;
                }
            } else {// 针对性的对该处进行了处理。挂起Layout会导致一些奇怪的问题。
                // 大多数setActiveTab主要是激活而不会做添加。
                if (previous === card || me.fireEvent('beforetabchange', me, card, previous) === false) {
                    return previous;
                }
                Ext.suspendLayouts();
            }
            // MUST set the activeTab first so that the machinery which listens for show doesn't
            // think that the show is "driving" the activation and attempt to recurse into here.
            me.activeTab = card;
            // Attempt to switch to the requested card. Suspend layouts because if that was successful
            // we have to also update the active tab in the tab bar which is another layout operation
            // and we must coalesce them.
            me.layout.setActiveItem(card);
            // Read the result of the card layout. Events dear boy, events!
            card = me.activeTab = me.layout.getActiveItem();
            // Card switch was not vetoed by an event listener
            if (card && card !== previous) {
                // Update the active tab in the tab bar and resume layouts.
                me.tabBar.setActiveTab(card.tab);
                Ext.resumeLayouts(true);
                // previous will be undefined or this.activeTab at instantiation
                if (previous !== card) {
                    me.fireEvent('tabchange', me, card, previous);
                }
            } else // Card switch was vetoed by an event listener. Resume layouts (Nothing should have changed on a veto).
            {
                Ext.resumeLayouts(true);
            }
            return card;
        }
        return previous;
    },

    focusOnNext: function (field, focusUp, event) {
        var me = this;
        if (me.destroyed)
            return false;

        var item = me.getActiveTab();
        if (!item) {
            return me.callParent(arguments);
        } else if (Ext.isFunction(item.focusOnNext)) {
            if (item.focusOnNext(field, focusUp, event))
                return true;
        } else if (item.focusable && item.canFocus() && item.readOnly != true) {
            if (item.getFocusEl()) {
                item.focus();
                return true;
            }
        }

        var up = me.up();
        if (!!up && up instanceof Ext.container.Container && focusUp === true) {
            return up.focusOnNext(me);
        }
    },

    isValid: function (skipBlank) {
        var me = this,
            items = me.items.items,
            valid = true;

        if (me.deferredRender) {
            items = [me.getActiveTab()];
        }

        Ext.Array.each(items, function (item) {
            if (Ext.isFunction(item.isValid)) {// 有isValid方法的，先调用，正确则返回
                valid = valid && item.isValid(skipBlank);
            }
        });
        return valid;
    },

    /**
     * 验证容器中的所有字段正确性
     * @return {String[]} Array of any validation errors
     */
    getErrors: function () {
        var me = this,
            items = me.items.items,
            errors = [];

        if (me.deferredRender) {
            items = [me.getActiveTab()];
        }

        Ext.Array.each(items, function (item) {
            var list = [];
            if (item instanceof Ext.form.field.Base) {
                Ext.Array.each(item.getErrors(), function (error) {
                    var message = {
                        text: error,
                        source: item
                    };
                    if (!Ext.isEmpty(item.fieldCaption)) {
                        message.text = item.fieldCaption + "：" + error;
                    }
                    errors.push(message);
                });
            } else if (item instanceof Ext.form.CheckboxGroup) {
                Ext.Array.each(item.getErrors(), function (error) {
                    var message = {
                        text: error,
                        source: item
                    };
                    if (!Ext.isEmpty(item.fieldCaption)) {
                        message.text = item.fieldCaption + "：" + error;
                    }
                    errors.push(message);
                });
            } else if (item instanceof Ext.container.Container) {
                list = item.getErrors();
            } else if (Ext.isFunction(item.getErrors)) {// 提供了getErrors方法的直接取。
                list = item.getErrors();
            }

            Ext.Array.each(list, function (message) {
                if(message['source']){
                    if (Ext.isFunction(message['source'].markInvalid)) {
                        message['source'].markInvalid(message['text']);
                    }
                }
                if (me.errorPrefixing && item.title) {
                    message.text = item.title + '/' + message.text
                }
                errors.push(message);
            });
        });
        return errors;
    }
});