$(function () {
    // 0. 自定义滚动条
    $(".content_list").mCustomScrollbar();

    var $audio = $("audio");
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;

    // 1. 加载音乐
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            // url 需要注意 前面不能使用 ../ ， 要是用 ./ ，原理暂时没有明白
            url: "./source/musiclist.json",
            dataType: "json",
            success: function (data) {
                // console.log(data);
                player.musicList = data;
                // 找到ul
                var musicList = $(".content_list ul");
                // 遍历musiclist.json获取数据，创建每首音乐
                $.each(data, function (index, ele) {
                    // 使用createMusicItem方法创建ul里面的每一条歌曲信息
                    var $item = createMusicItem(index, ele);
                    // 给ul添加新的li（歌曲信息）
                    musicList.append($item);
                });
                // 初始化歌曲信息
                initMusicInfo(data[0]);
                // 初始化歌词信息
                initMusicLyric(data[0]);
            },
            error: function (e) {
                console.log(e);
            }
        })
    }

    // 2. 初始化歌曲信息
    function initMusicInfo(music) {
        // 右边栏信息
        // 专辑图片
        var $musicImage = $(".song_info_pic img");
        // 歌名
        var $musicName = $(".song_info_name a");
        // 歌手
        var $musicSinger = $(".song_info_singer a");
        // 专辑
        var $musicAlbum = $(".song_info_ablum a");

        // 进度条上面的歌手信息
        var $musicProgressName = $(".music_progress_name");
        // 进度条上面的时长信息
        var $musicProgressTime = $(".music_progress_time");
        var $maskBg = $(".mask_bg");

        // 和musiclist.json里面的信息绑定
        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name +" - "+ music.singer);
        $musicProgressTime.text("00:00 /"+ music.time);
        $maskBg.css("background", "url("+ music.cover+")");
    }

    // 3. 初始化歌词信息
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");
        // lyric.loadLyric();
        // 清空上一首歌曲的歌词
        $lyricContainer.html("");
        lyric.loadLyric(function () {
            // 创建歌词列表
            $.each(lyric.lyrics, function (index, ele) {
                var $item = $("<li>" + ele + "</li>");
                $lyricContainer.append($item);
            })
        })
    }

    // 4. 初始化事件监听
    initEvent();
    function initEvent() {
        // 4.1 监听子菜单上鼠标移入移出事件
        // 动态添加的标签的事件需要事件委托
        $(".content_list").delegate(".list_music", "mouseenter", function () {
// 显示小菜单
            $(this).find(".list_menu").fadeIn(100);
            // 显示删除按钮
            $(this).find(".list_time a").fadeIn(100);
            // 隐藏时长
            $(this).find(".list_time span").fadeOut(100);
        });
        $(".content_list").delegate(".list_music", "mouseleave", function () {
            // 隐藏小菜单
            $(this).find(".list_menu").fadeOut(100);
            // 显示时长
            $(this).find(".list_time span").fadeIn(100);
            // 隐藏删除按钮
            $(this).find(".list_time a").fadeOut(100);
        });

        // 4.2 监听复选框点击
        $(".content_list").delegate(".list_check", "click", function () {
            $(this).toggleClass("list_checked");
        });

        // 4.3 同步子菜单播放和底部菜单播放
        $(".content_list").delegate(".list_menu_play", "click", function () {
            var $item = $(this).parents(".list_music");
            // console.log($item.get(0).index);
            // console.log($item.get(0).music);

            // 4.3.1 切换当前的开始/暂停
            $(this).toggleClass("list_menu_play2");
            // console.log($(this).prop("class"));
            // 排他
            $item.siblings().find(".list_menu_play").removeClass("list_menu_play2");

            // 4.3.2 同步切换底部的开始/暂停
            if ($(this).attr("class").indexOf("list_menu_play2") != -1) {
                // 子菜单当前是播放状态
                $(".music_play").addClass("music_play2");
                // 文字高亮 时长不高亮
                $item.find("div").css("color", "#ffffff");
                $item.find(".list_time").css("color", "rgba(255,255,255,0.5)");
                // 序号变播放gif
                $item.find(".list_number").addClass("list_number2");
                // 排他
                $item.siblings().find("div").css("color", "rgba(255,255,255,0.5)");
                $item.siblings().find(".list_time").css("color", "rgba(255,255,255,0.5)");
                $item.siblings().find(".list_number").removeClass("list_number2");
            } else {
                // 子菜单当前不是播放状态
                $(".music_play").removeClass("music_play2");
                // 文字不高亮
                $item.find("div").css("color", "rgba(255,255,255,0.5)");
                $item.find(".list_number").removeClass("list_number2");
            }

            // 4.3.3 播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);

            // 4.3.4 切换歌曲信息
            initMusicInfo($item.get(0).music);

            // 4.3.5 切换歌曲信息
            initMusicLyric($item.get(0).music);
        });

        // 底部控制区
        // 4.4 监听上一首
        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });

        // 4.5 监听开始暂停
        $(".music_play").click(function () {
            // 判断有没有播放过音乐
            if (player.currentIndex == -1) {
                // 没有播放过，播放第0首
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            } else {
                // 已经播放过，播放已经播放的歌曲
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });

        // 4.6 监听下一首
        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });

        // 4.7 监听删除按钮
        $(".content_list").delegate(".list_menu_del", "click", function () {
            // 获取被点击音乐
            var $item = $(this).parents(".list_music")
;

            // 判断当前删除的音乐是否是正在播放的音乐
            if ($item.get(0).index == player.currentIndex) {
                $(".music_next").trigger("click");
            }

            $item.remove();
            player.changeMusic($item.get(0).index);

            // 重新排序
            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number").text(index + 1);
            })
        });

        // 4.8 监听歌曲时长
        player.musicTimeUpdate(function (duration, currentTime, timeStr) {
            // 同步时间
            $(".music_progress_time").text(timeStr);
            // 同步时长
            // 计算播放比例
            var value = (currentTime / duration) *100;
            progress.setProgress(value);
            // 同步歌词
            var index = lyric.currentIndex(currentTime);
            var $item = $(".song_lyric li").eq(index);
            $item.addClass("cur");
            $item.siblings().removeClass();

            if (index < 0) return;
            $(".song_lyric").css({
                marginTop: (-index + 2) * 30
            });
        });

        // 4.9 监听歌曲循环方式按钮
        var musicMode = 1;
        $(".music_mode").click(function () {
            // 列表循环--列表顺序--随机循环--单曲循环
            if (musicMode < 4) {
                musicMode++;
                $(this).addClass("music_mode"+musicMode);
            } else {
                musicMode = 1;
                $(this).removeClass("music_mode2");
                $(this).removeClass("music_mode3");
                $(this).removeClass("music_mode4");
            }

        });

        // 4.10 监听收藏按钮
        $(".music_fav").click(function () {
            $(this).toggleClass("music_fav2");
        });

        // 4.11 监听下载按钮

        // 4.12 监听评论按钮

        // 4.13 监听纯净按钮
        $(".music_only").click(function () {
            $(this).toggleClass("music_only2");
        });

        // 4.14 监听声量调节
        $(".music_voice_icon").click(function () {
            // 开启/静音 图标切换
            $(this).toggleClass("music_voice_icon2");
            // 声音切换
            if ($(this).attr("class").indexOf("music_voice_icon2") != -1) {
                // 改为没有声音
                player.musicVoiceSeekTo(0);

            } else {
                // 改为有声音
                player.musicVoiceSeekTo(1);
            }
        })
    }

    // 5. 初始化进度条
    initProgress();
    function initProgress() {
        // 歌曲进度条
        // 进度条背景
        var $progressBar = $(".music_progress_bar");
        // 进度条前景
        var $progressLine = $(".music_progress_line");
        // 进度条圆点
        var $progressDot = $(".music_progress_dot");

        // 调用Progress.js
        progress = Progress($progressBar,$progressLine,$progressDot);
        // 调用progress里面的进度条点击方法
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        // 调用progress里面的进度条拖动方法
        progress.progressMove(function (value) {
            player.musicSeekTo(value);
        });

        // 声音进度条
        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });
    }

    // 6. 定义每一条音乐的显示格式
    function createMusicItem(index, music) {
        var $item = $('<li class="list_music">\n' +
'                            <div class="list_check"><i></i></div>\n' +
'                            <div class="list_number">'+ (index+1) +'</div>\n' +
'                            <div class="list_name">'+ music.name +'\n' +
'                                <div class="list_menu">\n' +
'                                    <a href="javascript:;" title="播放" class="list_menu_play"></a>\n' +
'                                    <a href="javascript:;" title="收藏"></a>\n' +
'                                    <a href="javascript:;" title="下载"></a>\n' +
'                                    <a href="javascript:;" title="分享"></a>\n' +
'                                </div>\n' +
'                            </div>\n' +
'                            <div class="list_singer">'+ music.singer +'</div>\n' +
'                            <div class="list_time">\n' +
'                                <span>'+ music.time +'</span>\n' +
'                                <a href="javascript:;" title="删除" class="list_menu_del"></a>\n' +
'                            </div>\n' +
'                        </li>');
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }
});