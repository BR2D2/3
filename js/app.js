function Logger(loggerName) {
    console.log(loggerName);
}
$(document).ready(function() {
    var DarkMode = localStorage.getItem('DarkMode');
    $('body').addClass("mdui-theme-primary-indigo mdui-theme-accent-pink");
    $('#app').html(`
    <div class="mdui-container">
        <div class="mdui-card App">
            <div class="MediaInfo">
                <h4>NOW PLAYING:</h4>
                <div class="TrackName">Cannot connect to MPC-HC</div>
            </div>
            <div class="TrackBar">
                <label class="mdui-slider">
                    <input type="range" id="TRACKBAR" value="0" step="1" min="0" max="100"/>
                </label>
                <input type="hidden" id="DURATION_TOTAL">
                <div class="Time">
                    <div class="CurrentTime">00:00:00</div>
                    <div class="Duration">00:00:00</div>
                </div>
            </div>
            <div class="Control">
                <button mdui-tooltip="{content: 'Play'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_Play"><i class="mdui-icon material-icons">play_arrow</i></button>
                <button mdui-tooltip="{content: 'Pause'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_Pause"><i class="mdui-icon material-icons">pause</i></button>
                <button mdui-tooltip="{content: 'Stop'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_Stop"><i class="mdui-icon material-icons">stop</i></button>
                <button mdui-tooltip="{content: 'Skip back'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_SK_Pre"><i class="mdui-icon material-icons">skip_previous</i></button>
                <button mdui-tooltip="{content: 'Decrease speed'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_FRew"><i class="mdui-icon material-icons">fast_rewind</i></button>
                <button mdui-tooltip="{content: 'Increase speed'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_FFor"><i class="mdui-icon material-icons">fast_forward</i></button>
                <button mdui-tooltip="{content: 'Skip forward'}" class="mdui-btn mdui-btn-icon mdui-ripple Handle_SK_Next"><i class="mdui-icon material-icons">skip_next</i></button>
                <button mdui-tooltip="{content: 'Dark/Light Mode'}" class="mdui-btn mdui-btn-icon mdui-ripple DarkMode_toggle"><i class="mdui-icon material-icons">dark_mode</i></button>
            </div>
            <div class="Control Sub">
                <div class="VolumeBar">
                    <label class="mdui-slider mdui-slider-discrete">
                        <input type="range" id="VOLUMEBAR" value="0" min="0" max="100"/>
                    </label>
                    <button mdui-tooltip="{content: 'Mute/Unmute'}" class="mdui-btn mdui-btn-icon mdui-ripple VolumeMute"><i class="mdui-icon material-icons">volume_off</i></button>
                </div>
            </div>
            <p style="color:gray;text-align:center"><b>MPC-HC WebUI</b> by michioxd - MPC-HC v<span class="MPC_VER"></span></p>
            <div class="mdui-panel SNAPSHOT_PARTIAL" mdui-panel>
                <div class="mdui-panel-item">
                    <div class="mdui-panel-item-header">
                        <div class="mdui-panel-item-title">SNAPSHOT</div>
                            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
                    </div>
                    <div class="mdui-panel-item-body">
                        <div class="SNAPSHOT_IMAGE">
                            
                        </div>
                        <div class="mdui-panel-item-actions">
                            <button class="mdui-btn mdui-ripple" mdui-panel-item-close>cancel</button>
                            <button class="mdui-btn mdui-ripple SNAPSHOT_PL">PLAY</button>
                             <button class="mdui-btn mdui-ripple SNAPSHOT_ST" style="display:none">Stop</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    `);

    function PlaySnapShot() {
        var count = 0;
        $.ajax({
            url: '/snapshot.jpg?ac' + count,
            method: 'GET',
            cache: false,
            success: function(data) {
                count++;
                $('#SNAPSHOT_IMAGE_SRC').attr('src', '/snapshot.jpg?ac' + count);
                var stt1 = setTimeout(PlaySnapShot, 10);
            },
            error: function(data) {
                mdui.snackbar({
                    message: 'Cannot get Snapshot image! Please try again!'
                });
            }
        })
    }
    $('.SNAPSHOT_PL').click(function() {
        $('.SNAPSHOT_IMAGE').html(`<img src="/snapshot.jpg" id="SNAPSHOT_IMAGE_SRC">`);
        PlaySnapShot();
        $(this).hide();
        $('.SNAPSHOT_ST').show();
    });
    $('.SNAPSHOT_ST').click(function() {
        $(this).hide();
        $('.SNAPSHOT_PL').show();
        $('#SNAPSHOT_IMAGE_SRC').remove();
        clearTimeout(stt1);
        clearTimeout(sttw);
    });

    if (DarkMode == "true") {
        $('body').addClass("mdui-theme-layout-dark");
    }
    $('#TRACKBAR').on('change', function() {
        var value = $(this).val();
        $.ajax({
            url: "/command.html",
            method: "POST",
            cache: false,
            data: {
                "wm_command": '-1',
                'percent': value
            },
            error: function() {
                mdui.snackbar({
                    message: 'Cannot connect to MPC-HC',
                });
            }
        });
    });

    function sec(str) {
        var a = str.split(':');
        return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    }
    $('#VOLUMEBAR').on('change', function() {
        $.ajax({
            url: "/command.html",
            method: "POST",
            cache: false,
            data: {
                "wm_command": '-2',
                'volume': $(this).val()
            },
            error: function() {
                mdui.snackbar({
                    message: 'Cannot connect to MPC-HC',
                });
            }
        });
    });
    $('.VolumeMute').click(function() {
        $.ajax({
            url: "/command.html",
            method: "POST",
            cache: false,
            data: {
                "wm_command": '909'
            },
            success: function(data) {
                $.ajax({
                    url: "/variables.html",
                    method: "GET",
                    cache: false,
                    success: function(data) {
                        var output = data.split('||');
                        var muted = output[11];
                        if (muted == "1") {
                            $('.VolumeMute .material-icons').html('volume_off');
                        } else {
                            $('.VolumeMute .material-icons').html('volume_up');
                        }
                    }
                });
            },
            error: function() {
                mdui.snackbar({
                    message: 'Cannot connect to MPC-HC',
                });
            }
        });

    });
    $('.Handle_Play').click(function() {
        PostData(887);
    });
    $('.Handle_Pause').click(function() {
        PostData(888);
    });
    $('.Handle_Stop').click(function() {
        PostData(890);
    });
    $('.Handle_SK_Pre').click(function() {
        PostData(921);
    });
    $('.Handle_SK_Next').click(function() {
        PostData(922);
    });
    $('.Handle_FRew').click(function() {
        PostData(894);
    });
    $('.Handle_FFor').click(function() {
        PostData(895);
    });

    function PostData(num) {
        $.ajax({
            url: "/command.html",
            method: "POST",
            cache: false,
            data: {
                "wm_command": num
            },
            error: function() {
                mdui.snackbar({
                    message: 'Cannot connect to MPC-HC',
                });
            }
        });
    }
    $('.DarkMode_toggle').click(function() {
        var DarkMode = localStorage.getItem('DarkMode');
        if (DarkMode == "true") {
            localStorage.setItem('DarkMode', "false");
            $('body').removeClass("mdui-theme-layout-dark");
        } else {
            localStorage.setItem('DarkMode', "true");
            $('body').addClass("mdui-theme-layout-dark");
        }
    });

    function getStatus() {
        $.ajax({
            url: "/variables.html",
            method: "GET",
            cache: false,
            success: function(data) {
                var output = data.split('||');
                var ver = output[15];
                $('.MPC_VER').html(ver);
                $.ajax({
                    url: "/snapshot.jpg",
                    method: "GET",
                    cache: false,
                    success: function() {
                        $('.SNAPSHOT_PARTIAL').show();
                    },
                    error: function(xhr) {
                        if (xhr.status == 403) {
                            $('.SNAPSHOT_PARTIAL').hide();
                        } else {
                            $('.SNAPSHOT_PARTIAL').show();
                        }
                    }
                });
            },
            error: function() {
                mdui.snackbar({
                    message: 'Cannot connect to MPC-HC',
                });
            }
        });
    }
    getStatus();

    function updateStatus() {
        $.ajax({
            url: "/variables.html",
            method: "GET",
            cache: false,
            success: function(data) {
                var output = data.split('||');
                var fileName = output[0],
                    filePath = output[1],
                    fileDir = output[3],
                    state = output[5],
                    currentTime = output[7],
                    duration = output[9];
                var vol = output[10];
                var muted = output[11];
                if (vol != $('#VOLUMEBAR').val()) {
                    $('#VOLUMEBAR').val(vol);
                    mdui.updateSliders();
                }
                if (muted == "1") {
                    if ($('.VolumeMute .material-icons').text() != "volume_off") {
                        $('.VolumeMute .material-icons').html('volume_off');
                    }
                } else {
                    if ($('.VolumeMute .material-icons').text() != "volume_up") {
                        $('.VolumeMute .material-icons').html('volume_up');
                    }
                }
                if (fileName == '') {
                    $('.TrackName').html('Closed!');
                } else {
                    if ($('.TrackName').text() != fileName) {
                        $('.TrackName').html(fileName);
                        $('.TrackName').attr('title', fileName);
                    }
                }
                if (duration == '') {
                    $('.CurrentTime, .Duration').html('00:00:00');
                    $('#DURATION_TOTAL').val('0');
                } else {
                    if ($('.Duration').text() != duration) {
                        $('.Duration').html(duration);
                        $('.Duration').attr('title', duration);
                        $('#DURATION_TOTAL').val(duration);
                    }
                    if ($('.CurrentTime').text() != currentTime) {
                        $('.CurrentTime').html(currentTime);
                        $('.CurrentTime').attr('title', currentTime);
                    }
                }
                percentBar = Math.round(100 / (sec(duration) / sec(currentTime)));
                if (percentBar != $('#TRACKBAR').val()) {
                    $('#TRACKBAR').val(percentBar);
                    mdui.updateSliders();
                }
                setTimeout(UP, 500);
            },
            error: function() {
                mdui.snackbar({
                    message: 'Cannot connect to MPC-HC, Retrying in 10s...',
                });
                $('.TrackName').html('Cannot connect to MPC-HC');
                $('.CurrentTime').html('00:00:00');
                $('.Duration').html('00:00:00');
                $('#TRACKBAR').val(0);
                mdui.updateSliders();
                setTimeout(function() {
                    UP();
                }, 10000);
            }
        });
    }

    function UP() {
        updateStatus();
    }
    UP();
    mdui.mutation();
});