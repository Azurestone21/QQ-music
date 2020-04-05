(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        index: -1,
        // 加载歌词
        loadLyric: function (callBack) {
            var $this = this;
            $.ajax({
                // 接收传入的地址
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    // console.log(data);
                    // 使用parseLyric处理歌词
                    $this.parseLyric(data);
                    callBack();
                },
                error: function (e) {
                    console.log(e);
                }
            })
        },

        // 处理歌词信息
        parseLyric: function (data) {
            var $this = this;
            // 清空上一首歌曲信息
            $this.times = [];
            $this.lyrics = [];
            var array = data.split("\n");
            // console.log(array);
            // 正则表达式 匹配时间格式  [03:07.91]
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            // 遍历取出每一行歌词
            $.each(array, function (index, ele) {
                // 保存歌词
                var lrc = ele.split("]")[1];
                // console.log(lrc);
                // 排除空字符串
                if (lrc.length == 1) return true;
                $this.lyrics.push(lrc);
                // console.log(ele);
                var res = timeReg.exec(ele);
                // console.log(res);

                // 前面没有时间的文字
                if (res == null) return true;

                // 将时间格式转化为秒
                var timeStr = res[1];
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                // 保留两位小数
                var time = parseFloat(Number(min + sec).toFixed(2));
                // console.log(time);

                // 保存时间
                $this.times.push(time);
            });
            console.log($this.times, $this.lyrics);
        },
        currentIndex: function (currentIndex) {
            // console.log(currentIndex);
            if (currentIndex >= this.times[0]) {
                this.index++;
                this.times.shift();   //删除数组最前面的元素
            }
            return this.index;
        },
    };
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);