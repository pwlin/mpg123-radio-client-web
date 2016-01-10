/**
 * @include "./index.js"
 * @include "./router.js"
 */

radio.nowPlaying = {};

radio.nowPlaying.current = {
	timer: null,
	stationUrl: '',
	trackName: '',
	artistName: '',
	stationName: '',
	loadingthumbs: false,
	volume: 0,
	volumeOnInput: false,
	volumeTimer: null,
	volumeToggleState: '',
	audioBitrate:''
};

radio.nowPlaying.index = function(req, next) {
    this.listStations();
    $.getJSON(config.apiUrl + 'currentsong', {}, function(data, textStatus, req) {
		radio.nowPlaying.showCurrentTrack(data.currentsong);
		radio.nowPlaying.current.timer = setInterval(function() {
	    	$.getJSON(config.apiUrl + 'currentsong', {}, function(data, textStatus, req) {
	    		radio.nowPlaying.showCurrentTrack(data.currentsong);
	    	});
	    }, 1500);
    });
    
    $.getJSON(config.apiUrl + 'volume', {}, function(data, textStatus, req) {
		radio.nowPlaying.volume(data.soundLevel);
		radio.nowPlaying.showToggleSoundButton(data.soundState);
		radio.nowPlaying.current.volumeTimer = setInterval(function() {
	    	if (radio.nowPlaying.current.volumeOnInput === false) {
	    		$.getJSON(config.apiUrl + 'volume', {}, function(data, textStatus, req) {
	    			radio.nowPlaying.volume(data.soundLevel);
	    			radio.nowPlaying.showToggleSoundButton(data.soundState);
		    	});
	    	}
	    }, 1000);
    });   
    
};

radio.nowPlaying.listStations = function() {
	var txt = '<div class="stations-container"><ul class="stations">';
    config.stations.forEach(function(v, i) {
        txt += '<li onclick=\'radio.nowPlaying.play("' + encodeURIComponent(v.url) + '");\' class="station">';
        txt += '<img title="' + v.name + '" width="70" height="70" src="http://www.mysqueezebox.com/public/imageproxy?w=70&h=70&u=' + encodeURIComponent(v.icon) + '" />';
        txt +='</li>';
    }); 
    txt += '</ul></div>';
    $('.right').html(txt);
};

radio.nowPlaying.play = function(stationUrl) {
	$.getJSON(config.apiUrl + 'play/' + stationUrl, {}, function(data, textStatus, req) {});
};

radio.nowPlaying.showCurrentTrack = function(data) {
	var q = '',
		fetchTrackThumbs = false,
		i,
		k,
		stationIcon = '';
	for (i = 0, k = config.stations.length; i < k; i++) {
		if (data.stationUrl === config.stations[i].url) {
			stationIcon = config.stations[i].icon;
			if (typeof config.stations[i].fetchTrackThumbs !== 'undefined' && config.stations[i].fetchTrackThumbs === true) {
				fetchTrackThumbs = true;
			}
			break;
		}
	}
	if (radio.nowPlaying.current.stationUrl !== data.stationUrl) {
		radio.nowPlaying.current.stationUrl = data.stationUrl;
		$('.left .station-info-container .station-logos-container .track-logo').removeAttr('src');
		if (data.stationUrl === '') {
			$('.left .station-info-container .station-logos-container .station-logo').removeAttr('src');
		} else if (stationIcon !== '') {
			$('.left .station-info-container .station-logos-container .station-logo').attr('src', 'http://www.mysqueezebox.com/public/imageproxy?w=250&h=250&u=' + encodeURIComponent(stationIcon));
		}
	}
	if (radio.nowPlaying.current.artistName !== data.artistName) {
		radio.nowPlaying.current.artistName = data.artistName;
		if (data.artistName && data.artistName !== '') {
			$('.left .station-info-container .station-meta-container .artist-name').html(data.artistName);
		} else {
			$('.left .station-info-container .station-meta-container .artist-name').html('&nbsp;');
		}
		q += data.artistName + ' ';
	}
	if (radio.nowPlaying.current.trackName !== data.trackName) {
		radio.nowPlaying.current.trackName = data.trackName;
		if (data.trackName && data.trackName !== '') {
			$('.left .station-info-container .station-meta-container .track-name').html(data.trackName);
		} else {
			$('.left .station-info-container .station-meta-container .track-name').html('&nbsp;');
		}
		q += data.trackName + ' ';
	}
	if (radio.nowPlaying.current.stationName !== data.stationName) {
		radio.nowPlaying.current.stationName = data.stationName;
		if (data.stationName && data.stationName !== '') {
			$('.left .station-info-container .station-meta-container .station-name').html(data.stationName);
		} else {
			$('.left .station-info-container .station-meta-container .station-name').html('&nbsp;');
		}
	}
	q = q.trim();
	if (fetchTrackThumbs === true) {
		if (q !== '' && radio.nowPlaying.current.loadingthumbs === false) {
			radio.nowPlaying.current.loadingthumbs = true;
			$.getJSON(config.apiUrl + 'thumbs/track/' + encodeURIComponent(q), {}, function(data, textStatus, req) {
				if (data.thumb && data.thumb !== '') {
					$('.left .station-info-container .station-logos-container .track-logo').attr('src', 'http://www.mysqueezebox.com/public/imageproxy?w=100&u=' + encodeURIComponent(data.thumb));
				} else {
					$('.left .station-info-container .station-logos-container .track-logo').removeAttr('src');
				}
				radio.nowPlaying.current.loadingthumbs = false;
	    	});
		}
	}
	if (radio.nowPlaying.current.audioBitrate !== data.audioProperties.bitrate) {
		radio.nowPlaying.current.audioBitrate = data.audioProperties.bitrate;
		$('.left .current-track-container .buttons-container .audio-bitrate').html(data.audioProperties.bitrate);
	}
};

radio.nowPlaying.setVolume = function(val) {
	$.getJSON(config.apiUrl + 'volume/set/' + val, {}, function(data, textStatus, req) {
		radio.nowPlaying.current.volumeOnInput = false;
	});
};

radio.nowPlaying.volume = function(level) {
	if (radio.nowPlaying.current.volume !== level) {
		radio.nowPlaying.current.volume = level;
		$('.left .current-track-container .volume-container input[type="range"]').val(level);
	}
};

radio.nowPlaying.toggleSound = function() {
	$.getJSON(config.apiUrl + 'volume/toggle', {}, function(data, textStatus, req) {});
};

radio.nowPlaying.showToggleSoundButton = function(soundState) {
	if (radio.nowPlaying.current.volumeToggleState !== soundState) {
		radio.nowPlaying.current.volumeToggleState = soundState;
		if (soundState === 'on') {
			$('.left .current-track-container .buttons-container .volume-off-container').hide();
			$('.left .current-track-container .buttons-container .volume-on-container').show();
		} else {
			$('.left .current-track-container .buttons-container .volume-on-container').hide();
			$('.left .current-track-container .buttons-container .volume-off-container').show();
		}
	}
};

radio.nowPlaying.stop = function() {
	$.getJSON(config.apiUrl + 'stop', {}, function(data, textStatus, req) {});
};
