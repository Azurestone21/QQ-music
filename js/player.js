(function (window) {
    function Player($audio) {
        return Player.prototype.init($audio);
    }
    Player.prototype = {
        constructor: Player,
        musicList: [],

        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },

        // 用于记录现在播放的歌曲
        currentIndex: -1,
        playMusic: function (index, music) {
            // 判断是否是同一首
            if (this.currentIndex == index) {
                // 是同一首
                // 如果是暂停状态
                if (this.audio.paused) {
                    // 状态改为播放
                    this.audio.play();
                } else {
                    // 状态改为暂停
                    this.audio.pause();
                }
            } else {
                // 不是同一首
                // 改变歌曲mp3文件地址
                this.$audio.attr("src", music.link_url);
                // 播放
                this.audio.play();
                // 记录当前歌曲在json文件的数组中的索引
                this.currentIndex = index;
            }
        },

        // 歌曲索引处理 歌曲列表循环
        preIndex: function () {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = this.musicList.length - 1;
            }
            return index;
        },
        nextIndex: function () {
            var index = this.currentIndex + 1;
            if (index > this.musicList.length) {
                index = 0;
            }
            return index;
        },

        // 删除音乐
        changeMusic: function (index) {
            this.musicList.splice(index, 1);
            // 判断是否是当前播放歌曲的前面的歌曲
            /*
                在正在播放歌曲的前面的话，例如正在播放的歌曲的index=4，在重新排序后，index=3，但是currentIndex任然=4，这时候点击下一首，就会跳到第5首
             */
            if (index < this.currentIndex) {
                this.currentIndex -= 1;
            }
        },

        // 播放时长
        // getMusicDuration: function () {
        //     return this.audio.duration;
        // },
        // getCurrentTime: function () {
        //     return this.audio.currentTime;
        // },

        // 歌曲播放时间/总时长
        musicTimeUpdate: function (callBack) {
            var $this = this;
            this.$audio.on("timeupdate",function () {
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatTime(duration, currentTime);
                // 这里不能直接return，return是就近原则，这里return会返回给this.$audio，所以需要一个musicTimeUpdate传进来的方法获取内部的值
                callBack(duration, currentTime, timeStr);
            });
        },

        // 时间格式 00：00
        formatTime: function (duration, currentTime) {
            // 歌曲总时长
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            // 如果是个位数的话，需要在前面补零
            if (endMin < 10) {
                endMin = "0" + endMin;
            }
            if (endSec < 10) {
                endSec = "0" + endSec;
            }
            // 歌曲已进行时长
            var startMin = parseInt(currentTime / 60);
            var startSec = parseInt(currentTime % 60);
            // 如果是个位数的话，需要在前面补零
            if (startMin < 10) {
                startMin = "0" + startMin;
            }
            if (startSec < 10) {
                startSec = "0" + startSec;
            }
            return startMin +":"+ startSec +" / "+ endMin +":"+ endSec;
        },

        // 点击/移动跳转
        musicSeekTo: function (value) {
            if (isNaN(value)) return;
            this.audio.currentTime = this.audio.duration * value;
        },

        // 音量调节
        musicVoiceSeekTo: function (value) {
            if (isNaN(value)) return;
            if (value < 0 || value > 1) return;
            // 值的范围是 0~1
            this.audio.volume = value;
        },
    };

    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);