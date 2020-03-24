/**
 * Created by cRazy on 2016/12/20.
 */
Ext.define('overrides.selection.DataViewModel', {
    override: 'Ext.selection.DataViewModel',

    /**
     * @cfg {boolean} changeConfirm
     * 修改时，需要确认。若确认结果是false，则不做修改。
     */
    changeConfirm: false,

    isSelected: function (record) {
        record = Ext.isNumber(record) ? this.store.getAt(record) : record;
        if (!record)
            return false;
        return this.selected.containsKey(this.selected.getKey(record));
    },

    // Allow the DataView to update the ui
    onSelectChange: function (record, isSelected, suppressEvent, commitFn) {
        var me = this,
            view = me.view,
            eventName = isSelected ? 'select' : 'deselect',
            recordIndex = me.store.indexOf(record),
            changeConfirm = me.selected.contains(record) ? false : me.changeConfirm,
            changeConfirmText = me.changeConfirmText ? me.changeConfirmText : '是否确定修改';

        if (Ext.isFunction(changeConfirm)) {
            changeConfirm = changeConfirm();
        }

        if (!suppressEvent && me.selectionMode === "SINGLE" && changeConfirm && me.selected.length > 0) {
            Ext.Msg.confirm("提示", changeConfirmText, function (success) {
                if (success == 'yes') {
                    if ((suppressEvent || me.fireEvent('before' + eventName, me, record, recordIndex)) !== false &&
                        commitFn() !== false) {

                        if (view) {
                            if (isSelected) {
                                view.onItemSelect(record);
                            } else {
                                view.onItemDeselect(record);
                            }
                        }

                        if (!suppressEvent) {
                            me.fireEvent(eventName, me, record, recordIndex);
                        }
                    }
                }
            });
            return;
        }

        if ((suppressEvent || me.fireEvent('before' + eventName, me, record, recordIndex)) !== false &&
            commitFn() !== false) {

            if (view) {
                if (isSelected) {
                    view.onItemSelect(record);
                } else {
                    view.onItemDeselect(record);
                }
            }

            if (!suppressEvent) {
                me.fireEvent(eventName, me, record, recordIndex);
            }
        }
    }
});