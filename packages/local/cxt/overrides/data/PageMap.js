Ext.define('overrides.data.PageMap', {
    override: 'Ext.data.PageMap',

    hasRange: function (start, end) {
        var pageNumber = this.getPageFromRecordIndex(start),
            endPageNumber = this.getPageFromRecordIndex(end);
        for (; pageNumber <= endPageNumber; pageNumber++) {
            if (!this.hasPage(pageNumber)) {
                return false;
            }
        }
        return true;
    }
});