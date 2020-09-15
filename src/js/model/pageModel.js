class PageModel {

    pageNum = 1;
    pageSize = 10;
    total = 0;
    params = {};
    dataList = [];
    loading = true;

    constructor(obj) {
        if( obj && obj instanceof Object ) {
            this.setPage(obj);
        }
    }

    getPage() {
        return {
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            total: this.total,
            params: this.params,
            dataList: this.dataList,
        }
    }

    setPage(obj) {
        const { pageNum, pageSize, total, params, dataList, loading = false } = Object.assign({}, this.getPage(), obj);
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.total = total;
        this.params = params;
        this.dataList = dataList;
        this.loading = loading;
    }

    getParmaData() {
        return Object.assign({}, this.params, { pageNum: this.pageNum, pageSize: this.pageSize });
    }
    
}

export default PageModel;