/**
 * Created by cRazy on 2017/1/13.
 */Ext.define('overrides.plugin.Abstract', {
    override: 'Ext.plugin.Abstract',

    setDisabled: function (disabled) {
        this.disabled = disabled;
    }
});