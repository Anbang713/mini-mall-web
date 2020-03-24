/**
 * 账务科目
 *
 */
Ext.define('account.view.subject.Subject', {
    alias: 'account.subject',

    singleton: true,
    alternateClassName: 'Subject',

    moduleId: 'account.subject',
    moduleCaption: '科目',

    servicePath: 'api/account/subject/',
    cacheKeyPrefix: "mall:account:subject:"

});