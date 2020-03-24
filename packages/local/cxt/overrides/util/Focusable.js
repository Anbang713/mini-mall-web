/**
 * Created by cRazy on 2016/9/23.
 */
Ext.define('overrides.util.Focusable', {
    override: 'Ext.util.Focusable',

    requires: [
        'Ext.dom.Element',
        'Ext.event.Event'
    ],

    privates: {

        /**
         * Returns focus to the cached previously focused Component or element.
         *
         * Usually called by onHide.
         *
         * @private
         */
        revertFocus: function () {
            var me = this,
                focusEvent = me.focusEnterEvent,
                focusTarget, hasFocus;

            me.previousFocus = null;
            me.containsFocus = false;

            // If this about to be hidden component contains focus...
            hasFocus = me.el.contains(Ext.Element.getActiveElement());

            // Before hiding, restore focus to what was focused when we were shown
            // unless we're explicitly told not to (think Panel collapse/expand).
            if (!me.preventRefocus && focusEvent && hasFocus) {
                focusTarget = focusEvent.fromComponent;

                // If reverting back to a Component, it will re-route to a close focusable relation
                // if it is not now focusable. But check that it's a Component because it can be
                // a Widget instead!
                if (focusTarget && focusTarget.canFocus && !focusTarget.canFocus()) {
                    focusTarget.focus();
                }
                // The component canFocus, so we can simply focus its element.
                else {
                    focusTarget = Ext.fly(focusEvent.relatedTarget);
                    // TODO: Remove extra check when IE8 retires.
                    if (Ext.isIE8 || (focusTarget.isFocusable && focusTarget.isFocusable())) {
                        focusTarget.focus();
                    }
                }
            }
        },

        /**
         * Finds an alternate Component to focus if this Component is disabled while focused, or
         * focused while disabled, or otherwise unable to focus.
         *
         * In both cases, focus must not be lost to document.body, but must move to an intuitively
         * connectible Component, either a sibling, or uncle or nephew.
         *
         * This is both for the convenience of keyboard users, and also for when focus is tracked
         * within a Component tree such as for ComboBoxes and their dropdowns.
         *
         * For example, a ComboBox with a PagingToolbar in is BoundList. If the "Next Page"
         * button is hit, the LoadMask shows and focuses, the next page is the last page, so
         * the "Next Page" button is disabled. When the LoadMask hides, it attempt to focus the
         * last focused Component which is the disabled "Next Page" button. In this situation,
         * focus should move to a sibling within the PagingToolbar.
         *
         * @return {Ext.Component} A closely related focusable Component to which focus can move.
         * @private
         */
        findFocusTarget: function () {
            var me = this,
                owner,
                focusTargets;

            for (owner = me.up(':not([disabled])'); owner; owner = owner.up(':not([disabled])')) {
                // Use CQ to find a target that is focusable, and not this Component.
                // Cannot use owner.child() because the parent might not be a Container.
                // Non-Container Components may still have ownership relationships with
                // other Components. eg: BoundList with PagingToolbar
                focusTargets = Ext.ComponentQuery.query(':focusable:not([hasFocus])', owner);
                if (focusTargets.length) {
                    return focusTargets[0];
                }

                // We found no focusable siblings in our owner, but the owner may itself be focusable,
                // it is not always a Container - could be the owning Field of a BoundList.
                if (owner.isFocusable && owner.isFocusable()) {
                    return owner;
                }
            }
        },

        /**
         * Sets up the focus listener on this Component's {@link #getFocusEl focusEl} if it has one.
         *
         * Form Components which must implicitly participate in tabbing order usually have a naturally
         * focusable element as their {@link #getFocusEl focusEl}, and it is the DOM event of that
         * receiving focus which drives the Component's `onFocus` handling, and the DOM event of it
         * being blurred which drives the `onBlur` handling.
         * @private
         */
        initFocusableElement: function () {
            var me = this,
                tabIndex = me.tabIndex,
                focusEl = me.getFocusEl();

            if (focusEl && !focusEl.isComponent) {
                // Cache focusEl as a property for speedier lookups
                me.focusEl = focusEl;

                // focusEl is not available until after rendering, and rendering tabIndex
                // into focusEl is not always convenient. So we apply it here if Component's
                // tabIndex property is set and Component is otherwise focusable.
                if (tabIndex != null && me.canFocus(true)) {
                    me.setTabIndex(tabIndex, focusEl);
                }

                // This attribute is a shortcut to look up a Component by its Elements
                // It only makes sense on focusable elements, so we set it here
                focusEl.dom.setAttribute(Ext.Component.componentIdAttribute, me.id);

                // Only focusable components can be keyboard-interactive
                if (me.config.keyHandlers) {
                    me.initKeyHandlers(focusEl);
                }
            }
        },

        /**
         * @private
         */
        getFocusTask: function () {
            if (!this.focusTask) {
                this.focusTask = Ext.focusTask;
            }

            return this.focusTask;
        },

        /**
         * @private
         */
        handleFocusEvent: function (e) {
            var event;
            // TODO
            // handleFocusEvent and handleBlurEvent are called by ComponentManager
            // passing the normalized element event that might or might not cause
            // component focus or blur. The component itself makes the decision
            // whether focus/blur happens or not. This is necessary for components
            // that might have more than one focusable element within the component's
            // DOM structure, like Ext.button.Split.
            if (this.isFocusing(e)) {
                event = new Ext.event.Event(e.event);
                event.type = 'focus';
                event.relatedTarget = e.fromElement;
                event.target = e.toElement;

                this.onFocus(event);
            }
        },

        /**
         * @private
         */
        handleBlurEvent: function (e) {
            var event;

            if (this.isBlurring(e)) {
                event = new Ext.event.Event(e.event);
                event.type = 'blur';
                event.target = e.fromElement;
                event.relatedTarget = e.toElement;

                this.onBlur(event);
            }
        },

        /**
         * @private
         */
        isFocusing: function (e) {
            var from = e.fromElement,
                to = e.toElement,
                focusEl;

            if (this.focusable) {
                focusEl = this.getFocusEl();

                if (focusEl) {
                    if (focusEl.isComponent) {
                        return focusEl.isFocusing(from, to);
                    }
                    else {
                        return to === focusEl.dom && from !== to;
                    }
                }
            }

            return false;
        },

        /**
         * @private
         */
        isBlurring: function (e) {
            var from = e.fromElement,
                to = e.toElement,
                focusEl;

            if (this.focusable) {
                focusEl = this.getFocusEl();

                if (focusEl) {
                    if (focusEl.isComponent) {
                        return focusEl.isBlurring(from, to);
                    }
                    else {
                        return from === focusEl.dom && from !== to;
                    }
                }
            }

            return false;
        },

        /**
         * @private
         */
        blur: function () {
            var me = this,
                focusEl;

            if (!me.focusable || !me.canFocus()) {
                return;
            }

            focusEl = me.getFocusEl();

            if (focusEl) {
                me.blurring = true;
                focusEl.blur();
                delete me.blurring;
            }

            return me;
        },

        disableTabbing: function () {
            var me = this,
                el = me.el,
                focusEl;

            if (el) {
                el.saveTabbableState();
            }

            focusEl = me.getFocusEl();

            if (focusEl) {
                // focusEl may happen to be a focus delegate for a container
                if (focusEl.isComponent) {
                    focusEl.disableTabbing();
                }

                // Alternatively focusEl may happen to be outside of the main el,
                // or else it can be a string reference to an element that
                // has not been resolved yet
                else if (focusEl.isElement && el && !el.contains(focusEl)) {
                    focusEl.saveTabbableState();
                }
            }
        },

        enableTabbing: function () {
            var me = this,
                el = me.el,
                focusEl;

            focusEl = me.getFocusEl();

            if (focusEl) {
                if (focusEl.isComponent) {
                    focusEl.enableTabbing();
                }
                else if (focusEl.isElement && el && !el.contains(focusEl)) {
                    focusEl.restoreTabbableState();
                }
            }

            if (el) {
                el.restoreTabbableState();
            }
        }
    }
});