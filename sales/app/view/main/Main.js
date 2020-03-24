/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 */
Ext.define('sales.view.main.Main', {
    extend: 'Ext.container.Viewport',

    requires: [
        'Ext.layout.container.Fit'
    ],

    controller: 'main',
    layout: 'fit'
});
