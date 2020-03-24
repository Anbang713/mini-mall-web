/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 *
 * 注意：禁止修改这个类
 */
Ext.define('sales.Application', {
    extend: 'Cpnt.Application',

    requires: [
        'sales.view.*'
    ],

    defaultToken: 'catalog',

    name: 'sales',

    /** 写这个只是为了自动加载*/
    neverused: function () {
        console.log(sales.view.main.Main);
    }
});
