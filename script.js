const clientId = 'cc68dd35236641bdbe8ab14888f6c883';
const redirectUri = 'https://jesseiskewl01.github.io';
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

async function fetchLyricsFromMusixmatch(trackName, artistName) {
    const apiKey = 'your_musixmatch_api_key';
    const url = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?format=json&apikey=${apiKey}&q_track=${encodeURIComponent(trackName)}&q_artist=${encodeURIComponent(artistName)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch lyrics');
        }
        const data = await response.json();
        if (data.message.body.lyrics) {
            displayLyrics(data.message.body.lyrics.lyrics_body);
        } else {
            throw new Error('Lyrics not found');
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error.message);
        displayLyrics('Lyrics not found');
    }
}

function displayLyrics(lyrics) {
    const lyricsContainer = document.getElementById('lyrics-container');
    lyricsContainer.innerHTML = '';

    if (lyrics) {
        const lyricsLines = lyrics.split('\n');
        lyricsLines.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            lyricsContainer.appendChild(p);
        });

        document.getElementById('lyrics').classList.remove('hidden');

        syncLyrics(lyricsLines);
    } else {
        lyricsContainer.textContent = 'Lyrics not found';
    }
}

function syncLyrics(lyricsLines) {
    const lyricsContainer = document.getElementById('lyrics-container');
    let currentIndex = 0;

    function updateLyrics() {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
            return;
        }

        fetch('https://api.spotify.com/v1/me/player', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.item) {
                const progressMs = data.progress_ms;
                while (currentIndex < lyricsLines.length && getTimestamp(lyricsLines[currentIndex]) <= progressMs) {
                    currentIndex++;
                }

                lyricsContainer.querySelectorAll('p').forEach((p, index) => {
                    if (index === currentIndex) {
                        p.classList.add('highlight');
                    } else {
                        p.classList.remove('highlight');
                    }
                });
            }
        });

        setTimeout(updateLyrics, 1000);
    }

    updateLyrics();
}

function getTimestamp(lyricLine) {
    return Infinity;
}
