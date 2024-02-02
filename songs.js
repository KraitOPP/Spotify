// Variable to store the currently playing audio element
let currentlyPlayingAudio = null;
let currentSongIndex = 0; // Track the index of the currently playing song
const parsedData = []; // Define a global variable to store parsed data

// Function to parse the text file from a URL
function parseTextFileFromURL(fileURL) {
    return axios.get(fileURL)
        .then(response => {
            const fileContent = response.data;
            const entries = fileContent.split(/\r?\n\r?\n/);
            const parsedData = [];

            for (const entry of entries) {
                const lines = entry.split(/\r?\n/);
                const title = lines[0].trim();
                const thumbnail = lines[1].trim();
                const audioSrc = lines[2].trim();
                const description = lines[3].trim();

                parsedData.push({
                    title,
                    thumbnail,
                    audioSrc,
                    description,
                });
            }

            return parsedData;
        })
        .catch(error => {
            console.error('Error fetching or parsing file:', error.message);
            throw error;
        });
}

// Function to dynamically load parsed data into HTML
function loadSongsIntoHTML(data) {
    const songsListDiv = document.querySelector('.songs-list');

    data.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';

        // Set data attributes for title, thumbnail, audio source, and description
        songCard.dataset.title = song.title;
        songCard.dataset.thumbnail = song.thumbnail;
        songCard.dataset.audioSrc = song.audioSrc;
        songCard.dataset.description = song.description;
        songCard.dataset.index = index;

        // Create HTML elements for the song card
        const songThumbnail = document.createElement('div');
        songThumbnail.className = 'song-thumbnail';
        const thumbnailImage = document.createElement('img');
        thumbnailImage.src = song.thumbnail;
        thumbnailImage.alt = '';
        songThumbnail.appendChild(thumbnailImage);

        const songName = document.createElement('div');
        songName.className = 'song-name';
        songName.textContent = song.title;

        const songDescriptionDiv = document.createElement('div');
        songDescriptionDiv.className = 'song-description-div';
        const songDescription = document.createElement('p');
        songDescription.className = 'song-description';
        songDescription.textContent = song.description;
        songDescriptionDiv.appendChild(songDescription);

        // Append created elements to the song card
        songCard.appendChild(songThumbnail);
        songCard.appendChild(songName);
        songCard.appendChild(songDescriptionDiv);

        // Append song card to the songs list
        songsListDiv.appendChild(songCard);

        // Attach click event listener to each song card
        songCard.addEventListener('click', () => handleCardClick(index));
    });
}

// Function to handle card click event
function handleCardClick(index) {
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
    }
    playAudio(index);
}

// Function to play audio and handle events
function playAudio(index) {
    const audioSrc = parsedData[index].audioSrc;
    const audio = new Audio(audioSrc);
    currentlyPlayingAudio = audio;

    audio.addEventListener('ended', () => {
        // Automatically play the next song when the current song ends
        handlePlayNextClick();
    });

    audio.play();
    updatePlayPauseButton(true);

    currentSongIndex = index;
}

// Function to toggle play/pause
function togglePlayPause() {
    if (currentlyPlayingAudio.paused) {
        currentlyPlayingAudio.play();
    } else {
        currentlyPlayingAudio.pause();
    }

    updatePlayPauseButton(!currentlyPlayingAudio.paused);
}

// Function to update play/pause button
function updatePlayPauseButton(isPlaying) {
    const playPauseButton = document.querySelector('.play-pause');
    playPauseButton.src = isPlaying ? 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/pause-icon.svg' : 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/play-circle-outline.svg';
}

// Function to handle play-next button click event
function handlePlayNextClick() {
    if (currentlyPlayingAudio) {
        // Pause the currently playing audio
        currentlyPlayingAudio.pause();

        // Increment the current song index
        currentSongIndex = (currentSongIndex + 1) % parsedData.length;

        // Play the next song
        playAudio(currentSongIndex);
    }
}

// Function to handle play-previous button click event
function handlePlayPreviousClick() {
    if (currentlyPlayingAudio) {
        // Pause the currently playing audio
        currentlyPlayingAudio.pause();

        // Decrement the current song index
        currentSongIndex = (currentSongIndex - 1 + parsedData.length) % parsedData.length;

        // Play the previous song
        playAudio(currentSongIndex);
    }
}

// Function to update the playback progress
function updatePlaybackProgress() {
    const animateTime = document.querySelector('.animate-time');
    const startTime = document.querySelector('.start-time');
    const endTime = document.querySelector('.end-time');

    if (currentlyPlayingAudio) {
        const progress = (currentlyPlayingAudio.currentTime / currentlyPlayingAudio.duration) * 100;
        animateTime.style.width = `${progress}%`;

        // Update start and end time
        startTime.textContent = formatTime(currentlyPlayingAudio.currentTime);
        endTime.textContent = formatTime(currentlyPlayingAudio.duration);
    }
}

// Function to format time (in seconds) as mm:ss
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to handle main-time click event
function handleMainTimeClick(event) {
    // Calculate the percentage of the clicked position
    const clickedPercentage = (event.offsetX / event.currentTarget.offsetWidth) * 100;

    // Calculate the corresponding time based on the percentage
    const newTime = (clickedPercentage / 100) * currentlyPlayingAudio.duration;

    // Set the new time for the audio playback
    currentlyPlayingAudio.currentTime = newTime;
}

// Attach click event listener to main-time element
const mainTimeElement = document.getElementById('mainTime');
mainTimeElement.addEventListener('click', handleMainTimeClick);

// Attach click event listeners to the next and previous buttons
const playNextButton = document.querySelector('.play-next');
playNextButton.addEventListener('click', handlePlayNextClick);

const playPreviousButton = document.querySelector('.play-previous');
playPreviousButton.addEventListener('click', handlePlayPreviousClick);

// Set up a timer to continuously update playback progress
setInterval(updatePlaybackProgress, 500);

// Provide the URL to your text file
const fileURL = 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/SongsInfo/SongsDetails.txt';

// Call the function to parse text file and load data into HTML
parseTextFileFromURL(fileURL)
    .then(data => {
        // Log the parsed data
        console.log(data);

        // Load parsed data into HTML
        parsedData.push(...data);

        // Set the current song index to the first song

        loadSongsIntoHTML(data);
    })
    .catch(error => {
        // Handle errors
        console.error('Error parsing text file:', error.message);
    });

// Attach click event listener to play-pause button
const playPauseButton = document.querySelector('.play-pause');
playPauseButton.addEventListener('click', togglePlayPause);




// Function to handle volume-up button click event
function handleVolumeUpClick() {
    if (currentlyPlayingAudio) {
        if (currentlyPlayingAudio.muted) {
            // Unmute the audio
            currentlyPlayingAudio.muted = false;
        } else {
            // Toggle mute
            currentlyPlayingAudio.muted = true;
        }

        // Update volume animation and volume-up button image
        updateVolumeAnimate();
        updateVolumeUpImage(currentlyPlayingAudio.muted);
    }
}

// Function to handle click on sound-bar to change volume
function handleSoundBarClick(event) {
    if (currentlyPlayingAudio) {
        const soundBar = document.querySelector('.sound-bar');
        const soundBarRect = soundBar.getBoundingClientRect();

        // Calculate the percentage of the clicked position
        const clickedPercentage = (event.clientX - soundBarRect.left) / soundBarRect.width;

        // Set the new volume based on the percentage
        currentlyPlayingAudio.volume = clickedPercentage;

        // Update volume animation and volume-up button image
        updateVolumeAnimate();
        updateVolumeUpImage(currentlyPlayingAudio.muted);
    }
}

// Function to update volume animation based on the current volume
function updateVolumeAnimate() {
    const soundAnimate = document.querySelector('.sound-animate');
    const volume = currentlyPlayingAudio.muted ? 0 : currentlyPlayingAudio.volume * 100;
    soundAnimate.style.width = `${volume}%`;
}

// Function to update volume-up button image based on mute state
function updateVolumeUpImage(isMuted) {
    const volumeUpButton = document.querySelector('.volume-up');
    volumeUpButton.src = isMuted ? 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/mute.svg' : 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/volume-up.svg';
}

// Attach click event listener to volume-up button
const volumeUpButton = document.querySelector('.volume-up');
volumeUpButton.addEventListener('click', handleVolumeUpClick);

// Attach click event listener to sound-bar
const soundBar = document.querySelector('.sound-bar');
soundBar.addEventListener('click', handleSoundBarClick);
