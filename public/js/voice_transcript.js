try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
} catch (e) {
    console.error(e);
    alert('Your browser does not support speech recognition. Please use a supported browser.');
}

var subtitles = document.getElementById('subtitles');
var startSpeechBtn = document.getElementById('startSpeechBtn');
var isListening = false;

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech API captures a line. 
recognition.onresult = function(event) {
    // event is a SpeechRecognitionEvent object.
    // It holds all the lines we have captured so far. 
    // We only need the current one.
    var current = event.resultIndex;

    // Get a transcript of what was said.
    var transcript = event.results[current][0].transcript;

    // Add the current transcript to the subtitles.
    subtitles.textContent = transcript;
};

recognition.onstart = function() {
    console.log('Voice recognition activated. Try speaking into the microphone.');
    startSpeechBtn.innerHTML = '<span class="icon"><i class="fa-solid fa-comment-dots"></i></span> Subtitles Off';
    isListening = true;
}

recognition.onspeechend = function() {
    console.log('You were quiet for a while so voice recognition turned itself off.');
    startSpeechBtn.innerHTML = '<span class="icon"><i class="fa-solid fa-comment-dots"></i></span> Subtitles Off';
    isListening = false;
}

recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
        console.log('No speech was detected. Try again.');
    };
}

// Toggle speech recognition when the button is clicked
startSpeechBtn.addEventListener('click', function() {
    if (isListening) {
        recognition.stop();
        isListening = false;
        startSpeechBtn.innerHTML = '<span class="icon"><i class="fa-solid fa-comment-dots"></i></span> Start Speech-to-Text';
    } else {
        recognition.start();
        isListening = true;
        startSpeechBtn.innerHTML = '<span class="icon"><i class="fa-solid fa-comment-dots"></i></span> Stop Speech-to-Text';
    }
});