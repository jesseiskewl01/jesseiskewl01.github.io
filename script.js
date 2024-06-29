const clientId = 'cc68dd35236641bdbe8ab14888f6c883';
const redirectUri = 'https://github.com/jesseiskewl01/jesseiskewl01.github.io';
const scopes = 'user-read-playback-state user-read-currently-playing';

document.getElementById('login-button').addEventListener('click', () => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
});

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1).split('&').reduce((acc, item) => {
        if (item) {
            const parts = item.split('=');
            acc[parts[0]] = decodeURIComponent(parts[1]);
        }
        return acc;
    }, {});

    if (hash.access_token) {
        localStorage.setItem('spotify_access_token', hash.access_token);
        window.location.hash = '';
        getCurrentlyPlaying();
    }
});

async function getCurrentlyPlaying() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
        return;
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        displaySongInfo(data);
    } else {
        console.error('Failed to fetch currently playing song');
    }
}

function displaySongInfo(data) {
    const songInfo = document.getElementById('song-info');
    if (data && data.item) {
        songInfo.innerHTML = `
            <p>Song: ${data.item.name}</p>
            <p>Artist: ${data.item.artists.map(artist => artist.name).join(', ')}</p>
        `;
        fetchLyrics(data.item.name, data.item.artists[0].name);
    } else {
        songInfo.innerHTML = '<p>No song is currently playing</p>';
    }
}

async function fetchLyrics(songName, artistName) {
    // Implement the fetch from lrclib or another lyrics API
    // For now, just display dummy lyrics
    displayLyrics(`Lyrics for ${songName} by ${artistName}`);
}

function displayLyrics(lyrics) {
    const lyricsContainer = document.getElementById('lyrics-container');
    lyricsContainer.innerHTML = lyrics;
}
