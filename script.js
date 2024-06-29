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
        fetchCurrentlyPlaying();
    }
});

async function fetchCurrentlyPlaying() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
        console.error('No Spotify access token found');
        return;
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displaySongInfo(data);
        } else {
            console.error('Failed to fetch currently playing song:', response.status);
        }
    } catch (error) {
        console.error('Error fetching currently playing song:', error.message);
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
    try {
        const accessToken = '_DUPNacCt418SU4LntMk9Mi-BmB6JrNQzEmLZbqj_NK6f421Lt79urnwwDm_FNO8';
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(songName)} ${encodeURIComponent(artistName)}`;
        
        const searchResponse = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!searchResponse.ok) {
            throw new Error(`Failed to search for lyrics: ${searchResponse.status} ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        if (searchData.response.hits.length > 0) {
            const songPath = searchData.response.hits[0].result.api_path;
            const lyricsUrl = `https://api.genius.com${songPath}`;

            const lyricsResponse = await fetch(lyricsUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!lyricsResponse.ok) {
                throw new Error(`Failed to fetch lyrics: ${lyricsResponse.status} ${lyricsResponse.statusText}`);
            }

            const lyricsData = await lyricsResponse.json();
            const lyrics = lyricsData.response.song.lyrics;

            displayLyrics(lyrics);
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

    if (lyrics && lyrics !== 'Lyrics not found') {
        const lyricsLines = lyrics.split('\n');
        lyricsLines.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            lyricsContainer.appendChild(p);
        });

        document.getElementById('lyrics').classList.remove('hidden');

        // Implement your syncing logic here
    } else {
        lyricsContainer.textContent = 'Lyrics not found';
    }
}
