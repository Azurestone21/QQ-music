(function (window) {
    function Progress($progressBar,$progressLine,$progressDot) {
        return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
    }
    Progress.prototype = {
        constructor: Progress,
        init: function ($progressBar,$progressLine,$progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove: false,
        // 点击进度条任意位置，改变歌曲进度
        progressClick: function (callBack) {
            // 这里的this是index.js中的progress调用的，用来获取init里面的变量
            var $this = this;
            // 监听鼠标在进度条上的点击
            this.$progressBar.click(function (event) {
                // 这里的this是$progressBar
                // 获取背景距离窗口左边的位置
                var normalLeft = $(this).offset().left;
                // console.log(normalLeft);
                // 获取点击位置距离窗口左边的位置
                // var eventLeft = event || window.event.pageX;
                var eventLeft = event.pageX;
                // console.log(eventLeft);
                // 设置前景的宽度
                $this.$progressLine.css("width", eventLeft - normalLeft);
                $this.$progressDot.css("left", eventLeft - normalLeft);
                // 计算进度条比例
                var value = (eventLeft - normalLeft) / $(this).width();
                callBack(value);
            });
        },
        // 拖动进度条任意位置，改变歌曲进度
        progressMove: function (callBack) {
            var $this = this;
            // 获取背景距离窗口左边的位置
            var normalLeft = this.$progressBar.offset().left;
            var eventLeft;
            var barWidth = this.$progressBar.width();
            // 监听鼠标按下
            this.$progressBar.mousedown(function () {
                $this.isMove = true;
                // 监听鼠标移动
                $(document).mousemove(function (event) {
                    // 获取移动位置距离窗口左边的位置
                    // var eventLeft = event || window.event.pageX;
                    eventLeft = event.pageX;
                    // 前景宽度 = 移动位置距离窗口左边的位置 - 进度条最左边离窗口位置
                    var offset = eventLeft - normalLeft;
                    // 判断拖动是否超出进度条位置
                    if (offset >= 0 && offset <= barWidth) {
                        // 设置前景的宽度
                        $this.$progressLine.css("width", offset);
                        $this.$progressDot.css("left", offset);
                    }
                });
            });
            // 监听鼠标抬起
            $(document).mouseup(function () {
                $(document).off("mousemove");
                $this.isMove = false;
                // 计算进度条比例
                var value = (eventLeft - normalLeft) / $this.$progressBar.width();
                callBack(value);
            });
        },

        // 改变进度条前景位置随歌曲播放改变
        setProgress: function (value) {
            if (this.isMove) return;
            if (value < 0 || value >100) return;
            this.$progressLine.css({
                width: value + "%"
            });
            this.$progressDot.css({
                left: value + "%"
            });
        }
    };
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);