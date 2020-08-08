(function() {
    // Video background
    var md = new MobileDetect(window.navigator.userAgent);
    md = md.mobile(); 

    if (md !== null) {
        return false;
    }

    const video = document.querySelector('video');
    const source = document.createElement('source');
    source.src = './assets/snow.mp4';
    source.type = 'video/mp4;';

    video.appendChild(source);

    video.addEventListener('canplay', function() {
        video.play().catch(function (e) {
            console.log(e);
        });
    });
})();

(function() {
    // Snow link (de)generator
    const urlInput = document.querySelector('#snowUrl');
    const speedInput = document.querySelector('#snowSpeed');
    const frame = document.querySelector('#snowPreview');

    speedInput.addEventListener('change', (e) => {
        const speed = speedInput.value / 100;
        frame.src = `/widget/snow.html?speed=${speed}`;
        urlInput.value = `https://${window.location.hostname}/widget/snow.html?speed=${speed}`;
    });

    urlInput.addEventListener('focus', (e) => {
        urlInput.select();
    });

    urlInput.value = `https://${window.location.hostname}/widget/snow.html`;
})();