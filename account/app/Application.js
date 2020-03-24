/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 *
 * 注意：禁止修改这个类
 */
Ext.define('account.Application', {
    extend: 'Cpnt.Application',

    requires: [
        'account.view.*'
    ],

    defaultToken: 'catalog',

    name: 'account',

    /** 写这个只是为了自动加载*/
    neverused: function () {
        console.log(account.view.main.Main);
    }
});
