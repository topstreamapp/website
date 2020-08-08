/*
    Multiplayer by satanch
    v.0.2.1
*/

/* jshint esversion: 6 */

(function() {
    "use strict";

    const notyf = new Notyf();

    const $ = function(selector) {
        return document.querySelector(selector);
    };

    const container = $('.container');

    // TODO: [^\/]+ for service regex instead of [a-zA-Z0-9_-]
    // TODO: Promise.resolve() for sync

    const services = [
        {
            name: 'twitch-player',
            regex: /https\:\/\/www\.twitch\.tv\/[a-zA-Z0-9_-]+$/g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    const tempLink = document.createElement('a');
                    tempLink.href = url;
                    const twitchName = encodeURIComponent(tempLink.pathname);
                    resolve(`https://player.twitch.tv/?channel=${twitchName}`);
                });
            },
            asRow: true
        },
        {
            name: 'twitch-chat',
            regex: /https\:\/\/www\.twitch\.tv\/embed\/[a-zA-Z0-9_-]+\/chat$/g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    if(url.indexOf('?darkpopout') == -1)
                        url += '?darkpopout';
                    resolve(url);
                });
            }
        },
        {
            name: 'twitch-chat',
            regex: /.*peka2\.tv\/[a-zA-Z0-9_-]+\/chat$/g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    resolve(url);
                });
            }
        },
        {
            name: 'twitch-chat',
            regex: /https\:\/\/goodgame\.ru\/chat\/[a-zA-Z0-9_-]+\//g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    resolve(url);
                });
            }
        },
        {
            name: 'twitch-player',
            regex: /https\:\/\/goodgame\.ru\/channel\/.*/g,
            transform: function(url) {
                return new Promise(function(resolve, reject) {
                    const tempLink = document.createElement('a');
                    tempLink.href = url;
                    const channel = tempLink.pathname.split('/')[2];
                    fetch(`https://goodgame.ru/api/getchannelstatus?id=${channel}&fmt=json`, {
                        method: 'get'
                    }).then(function(data) {
                        data.json().then(function(jsonData) {
                            for(var sId in jsonData) {
                                resolve(`https://goodgame.ru/player?${sId}`);
                                break;
                            }
                        });
                    }).catch(reject);
                });
            },
            asRow: true
        },
        {
            name: 'twitch-player',
            regex: /https\:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+$/g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    const tempLink = document.createElement('a');
                    tempLink.href = url;
                    const YTName = encodeURIComponent(tempLink.search.replace('?v=', ''));
                    resolve(`https://www.youtube.com/embed/${YTName}?autoplay=1`);
                });
            },
            asRow: true
        },
        {
            name: 'twitch-chat',
            regex: /.*youtube\.com\/live_chat\?v=[a-zA-Z0-9_-]+\&is_popout=1/g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    resolve(url + '&embed_domain=' + window.location.hostname);
                });
            }
        },
        {
            name: 'twitch-chat',
            regex: /.*youtube\.com\/live_chat\?is_popout=1+\&v=[a-zA-Z0-9_-]*/g,
            transform: function(url) {
                return new Promise(function(resolve) {
                    resolve(url + '&embed_domain=' + window.location.hostname);
                });
            }
        },
    ];

    var rowCount = 0;
    var isLastRow = false;
    var frameList = [];

    const globalClass = 'frame';

    const splitScreen = function() {
        if(rowCount == 1)
            return false;

        const elementHeight = (100 / rowCount).toFixed(4);

        const styleExist = document.getElementById('split-style');
        if(styleExist !== null)
            styleExist.remove();

        const splitStyle = document.createElement('style');
        splitStyle.id = 'split-style';
        splitStyle.innerHTML = `.${globalClass} {height: ${elementHeight}%;}`;
        document.getElementsByTagName('head')[0].appendChild(splitStyle);
    };

    var helpRemoved = false;

    const addService = function(url) {
        services.forEach(function(service) {
            if(service.regex.test(url)) {
                if(service.asRow) {
                    rowCount++;
                } else {
                    if(!isLastRow) {
                        notyf.alert('Сначала необходимо добавить плеер, только потом чат!');
                        return false;
                    }
                }

                isLastRow = service.asRow;

                var frame = document.createElement('iframe');
                frame.className = service.name + ' ' + globalClass;
                frame = container.appendChild(frame);
                frame.setAttribute('allowfullscreen', 'true');

                service.transform(url).then(function(frameURL) {
                    if(!helpRemoved) {
                        $('.help').remove();
                        helpRemoved = true;
                    }

                    frame.src = frameURL;
                    frameList.push(url);

                    if(service.asRow) {
                        notyf.confirm('Плеер добавлен!');
                        splitScreen();
                    } else {
                        notyf.confirm('Чат добавлен!');
                    }

                    if($('#link') !== null)
                        $('#link').value = '';
                }).catch(function(err) {
                    console.log(err);
                });
            }
        });
    };

    $('#hide').onclick = function() {
        this.parentNode.style.display = 'none';
    };

    $('#add').onclick = function() {
        const field = $('#link');
        const userURL = field.value;

        if(userURL.length < 1) {
            notyf.alert('Введите ссылочку на канал или на чат канала.');
            return false;
        }

        addService(userURL);
    };

    //frameList
    $('#gen').onclick = function() {
        if(frameList.length === 0)
            return false;

        var linkList = '';

        frameList.forEach(function(frameLink) {
            linkList += frameLink + ';';
        });

        const longLink = btoa(linkList);
        window.location.hash = longLink;

        var JSONHeaders = new Headers();
        JSONHeaders.append('Content-Type', 'application/json');

        fetch('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBoq2lQkKcePldselkWD6LYi8pCykpHvPc', {
            method: 'post',
            body: JSON.stringify({
                "longUrl": window.location.href
            }),
            headers: JSONHeaders
        }).then(function(data) {
            data.json().then(function(jsonData) {
                $('#link').value = jsonData.id;
            });
        }).catch(function(err) {
            console.log(err);
        });
    };

    if(window.location.hash.length !== 0) {
        var urls = atob(window.location.hash.replace('#', '')).split(';');

        urls.forEach(function(url) {
            console.log(url);
            if(url.length === 0)
                return false;

            addService(url);
        });

        $('#topbar').remove();
    }
})();
