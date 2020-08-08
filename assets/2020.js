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
    const countInput = document.querySelector('#snowCount');
    const frame = document.querySelector('#snowPreview');

    const reactivity = (e) => {
        const speed = speedInput.value / 100;
        frame.src = `/widget/snow2.html?speed=${speed}&count=${countInput.value}`;
        urlInput.value = `https://${window.location.hostname}/widget/snow2.html?speed=${speed}&count=${countInput.value}`;
    };

    speedInput.addEventListener('change', reactivity);
    countInput.addEventListener('change', reactivity);

    urlInput.addEventListener('focus', (e) => {
        urlInput.select();
    });

    urlInput.value = `https://${window.location.hostname}/widget/snow2.html`;
})();