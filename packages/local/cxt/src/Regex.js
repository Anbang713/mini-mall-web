/**
 * Created by cRazy on 2016/10/26.
 */
Ext.define('Cxt.Regex', function () {
    return {
        singleton: true,

        w: {
            regex: /^[\w]+$/,
            regexText: '只能包含字母、数字、\"_\"。'
        },

        code: {
            regex: /^[\w\.\-\+]+$/,
            regexText: '只能包含字母、数字、\"_\"、\".\"、\"-\"、\"+\"。'
        },

        mail: {
            regex: /^(\w)+([\.\-\s\']\w+)*@(\w)+([\.\-\s\']\w+)*((\.\w{2,3}){1,3})$/,
            regexText: '不正确的邮件地址'
        },

        mobile: {
            regex: /^\d{11}$/,
            regexText: '手机号必须是11位数字'
        }
        
    }
});