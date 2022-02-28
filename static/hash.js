self.importScripts("/static/spark-md5.min.js"); // 导入脚本

// 生成文件 hash
self.onmessage = function(e) {
  var fileChunkList = e.data.fileChunkList;
  var spark = new self.SparkMD5.ArrayBuffer();
  let percentage = 0;
  let count = 0;
  var loadNext = function(index) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index].file);
    reader.onload = function(e) {
      count++;
      spark.append(e.target.result);
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,
          hash: spark.end()
        });
        self.close();
      } else {
        percentage += 100 / fileChunkList.length;
        self.postMessage({
          percentage: percentage
        });
        loadNext(count);
      }
    };
  };
  loadNext(0);
};
