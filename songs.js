let currentlyPlayingAudio = null;
let currentSongIndex = 0;
const parsedData = [];

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

function loadSongsIntoHTML(data) {
    const songsListDiv = document.querySelector('.songs-list');

    data.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';

        songCard.dataset.title = song.title;
        songCard.dataset.thumbnail = song.thumbnail;
        songCard.dataset.audioSrc = song.audioSrc;
        songCard.dataset.description = song.description;
        songCard.dataset.index = index;

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

        songCard.appendChild(songThumbnail);
        songCard.appendChild(songName);
        songCard.appendChild(songDescriptionDiv);

        songsListDiv.appendChild(songCard);

        songCard.addEventListener('click', () => handleCardClick(index));
    });
}

function handleCardClick(index) {
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
    }
    playAudio(index);
}

function playAudio(index) {
    const audioSrc = parsedData[index].audioSrc;
    const audio = new Audio(audioSrc);
    currentlyPlayingAudio = audio;

    audio.addEventListener('ended', () => {
        handlePlayNextClick();
    });

    audio.play();
    updatePlayPauseButton(true);

    currentSongIndex = index;
}

function togglePlayPause() {
    if (currentlyPlayingAudio.paused) {
        currentlyPlayingAudio.play();
    } else {
        currentlyPlayingAudio.pause();
    }

    updatePlayPauseButton(!currentlyPlayingAudio.paused);
}

function updatePlayPauseButton(isPlaying) {
    const playPauseButton = document.querySelector('.play-pause');
    playPauseButton.src = isPlaying ? 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/pause-icon.svg' : 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/play-circle-outline.svg';
}

function handlePlayNextClick() {
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentSongIndex = (currentSongIndex + 1) % parsedData.length;
        playAudio(currentSongIndex);
    }
}

function handlePlayPreviousClick() {
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentSongIndex = (currentSongIndex - 1 + parsedData.length) % parsedData.length;
        playAudio(currentSongIndex);
    }
}

function updatePlaybackProgress() {
    const animateTime = document.querySelector('.animate-time');
    const startTime = document.querySelector('.start-time');
    const endTime = document.querySelector('.end-time');

    if (currentlyPlayingAudio) {
        const progress = (currentlyPlayingAudio.currentTime / currentlyPlayingAudio.duration) * 100;
        animateTime.style.width = `${progress}%`;

        startTime.textContent = formatTime(currentlyPlayingAudio.currentTime);
        endTime.textContent = formatTime(currentlyPlayingAudio.duration);
    }
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function handleMainTimeClick(event) {
    const clickedPercentage = (event.offsetX / event.currentTarget.offsetWidth) * 100;
    const newTime = (clickedPercentage / 100) * currentlyPlayingAudio.duration;
    currentlyPlayingAudio.currentTime = newTime;
}

const mainTimeElement = document.getElementById('mainTime');
mainTimeElement.addEventListener('click', handleMainTimeClick);

const playNextButton = document.querySelector('.play-next');
playNextButton.addEventListener('click', handlePlayNextClick);

const playPreviousButton = document.querySelector('.play-previous');
playPreviousButton.addEventListener('click', handlePlayPreviousClick);

setInterval(updatePlaybackProgress, 500);

const fileURL = 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/SongsInfo/SongsDetails.txt';

parseTextFileFromURL(fileURL)
    .then(data => {
        console.log(data);
        parsedData.push(...data);
        loadSongsIntoHTML(data);
    })
    .catch(error => {
        console.error('Error parsing text file:', error.message);
    });

const playPauseButton = document.querySelector('.play-pause');
playPauseButton.addEventListener('click', togglePlayPause);

function handleVolumeUpClick() {
    if (currentlyPlayingAudio) {
        if (currentlyPlayingAudio.muted) {
            currentlyPlayingAudio.muted = false;
        } else {
            currentlyPlayingAudio.muted = true;
        }

        updateVolumeAnimate();
        updateVolumeUpImage(currentlyPlayingAudio.muted);
    }
}

function handleSoundBarClick(event) {
    if (currentlyPlayingAudio) {
        const soundBar = document.querySelector('.sound-bar');
        const soundBarRect = soundBar.getBoundingClientRect();
        const clickedPercentage = (event.clientX - soundBarRect.left) / soundBarRect.width;
        currentlyPlayingAudio.volume = clickedPercentage;
        updateVolumeAnimate();
        updateVolumeUpImage(currentlyPlayingAudio.muted);
    }
}

function updateVolumeAnimate() {
    const soundAnimate = document.querySelector('.sound-animate');
    const volume = currentlyPlayingAudio.muted ? 0 : currentlyPlayingAudio.volume * 100;
    soundAnimate.style.width = `${volume}%`;
}

function updateVolumeUpImage(isMuted) {
    const volumeUpButton = document.querySelector('.volume-up');
    volumeUpButton.src = isMuted ? 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/mute.svg' : 'https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/volume-up.svg';
}

const volumeUpButton = document.querySelector('.volume-up');
volumeUpButton.addEventListener('click', handleVolumeUpClick);

const soundBar = document.querySelector('.sound-bar');
soundBar.addEventListener('click', handleSoundBarClick);
