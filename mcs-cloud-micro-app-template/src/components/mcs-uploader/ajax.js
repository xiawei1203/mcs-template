export default class Ajax {

    static get(url, query, headers) {
        return new Promise((resolve, reject) => {

            if (query) {
                var parms = this.formatParams(query);
                url += '?' + parms;
            }
            var ajax = new XMLHttpRequest();
            ajax.open("GET", url, true);
            for (var h in headers) {
                ajax.setRequestHeader(h, headers[h]);
            }

            ajax.send(null);
            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4) {
                    if (ajax.status === 200) {
                        // let isJson = true;
                        // var res = isJson ? JSON.parse(ajax.responseText == "" ? '{}' : ajax.responseText) : ajax.responseText;
                        var res = JSON.parse(ajax.responseText == "" ? '{}' : ajax.responseText)
                        resolve(res);
                    } else {
                        // 请求失败
                        reject();
                    }

                }
            }
        });
    }

    /**
     * 
     * @param {String} url 请求地址
     * @param {Object} data 数据
     */
    static post(url, data, headers) {
        return new Promise((resolve, reject) => {
            var xhr = null;
            if (XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xhr.open("post", url, true);
            for (var h in headers) {
                xhr.setRequestHeader(h, headers[h]);
            }
            xhr.send(JSON.stringify(data));
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText))
                    }
                }
            }
        })
    }

    /**
     * 
     * @param {String} url 请求地址
     * @param {Object} query 数据
     */
    static del(url, query, headers) {
        return new Promise((resolve, reject) => {
            var xhr = null;
            if (XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (query) {
                var parms = this.formatParams(query);
                url += '?' + parms;
            }
            xhr.open("delete", url, true);
            for (var h in headers) {
                xhr.setRequestHeader(h, headers[h]);
            }
            xhr.send(null);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText))
                    }
                }
            }
        })
    }

    static formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        arr.push(("v=" + Math.random()).replace(".", ""));
        return arr.join("&");
    }
}