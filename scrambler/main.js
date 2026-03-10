let currentMatches = [];

document.getElementById('sortMethod').addEventListener('change', function() {
    if (currentMatches.length > 0) {
        sortAndDisplayMatches();
    }
});

document.getElementById('csvFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Optional: show a loading state here
        console.log("File selected:", file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log("File read successfully.");
            const text = e.target.result;
            try {
                processCSV(text);
            } catch (err) {
                console.error("Error processing CSV:", err);
                alert("An error occurred while processing the file. Check the browser console.");
            }
        };
        reader.onerror = function() {
            alert("Error reading the file.");
        };
        reader.readAsText(file);
    }
    // Note: Do not clear event.target.value here if we want the picker to keep showing the file name
});

function countLetters(text) {
    const targetLetters = new Set(['c', 'o', 'r', 'n', 'i', 's', 'h']);
    const foundLetters = new Set();
    const lowerText = text.toLowerCase();
    
    for (let char of lowerText) {
        if (targetLetters.has(char)) {
            foundLetters.add(char);
        }
    }
    return foundLetters.size;
}

function processCSV(csvText) {
    const statusMsg = document.getElementById('statusMessage');
    statusMsg.textContent = '';
    
    const rows = parseCSV(csvText);
    const matches = [];
    const uniqueMatches = new Set();

    if (rows.length === 0) {
        statusMsg.textContent = "The file appears to be empty.";
        return;
    }

    // Find headers
    const headers = rows[0].map(h => h.trim());
    const trackNameIndex = headers.indexOf('Track Name');
    let artistNameIndex = headers.indexOf('Artist Name(s)');
    
    // Fallbacks just in case the column name varies slightly
    if (artistNameIndex === -1) artistNameIndex = headers.indexOf('Artist Name');

    if (trackNameIndex === -1 || artistNameIndex === -1) {
        statusMsg.textContent = "Invalid CSV format: Could not find 'Track Name' or 'Artist Name(s)' columns.";
        console.error("Found headers:", headers);
        return;
    }

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length <= Math.max(trackNameIndex, artistNameIndex)) continue;

        const trackName = row[trackNameIndex];
        const artistName = row[artistNameIndex];

        if (trackName && countLetters(trackName) >= 6) {
            // Use totally lowercase key and collapse whitespace to prevent duplicates matching diff casing/spacing
            const normalize = str => str ? str.toLowerCase().replace(/\s+/g, ' ').trim() : '';
            const matchKey = normalize(trackName) + "|||" + normalize(artistName);
            if (!uniqueMatches.has(matchKey)) {
                uniqueMatches.add(matchKey);
                matches.push({ trackName, artistName });
            }
        }
    }

    currentMatches = matches;
    sortAndDisplayMatches();
}

function sortAndDisplayMatches() {
    const sortMethod = document.getElementById('sortMethod').value;
    
    if (sortMethod === 'length') {
        currentMatches.sort((a, b) => a.trackName.length - b.trackName.length);
    } else if (sortMethod === 'alpha') {
        currentMatches.sort((a, b) => a.trackName.toLowerCase().localeCompare(b.trackName.toLowerCase()));
    } else if (sortMethod === 'artist') {
        currentMatches.sort((a, b) => a.artistName.toLowerCase().localeCompare(b.artistName.toLowerCase()));
    }
    
    displayResults(currentMatches);
}

// Basic CSV parser to handle quotes
function parseCSV(text) {
    const ret = [];
    let state = 0; // 0: unquoted, 1: quoted
    let value = "";
    let row = [];
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        switch (state) {
            case 0:
                if (char === '"') {
                    state = 1;
                } else if (char === ',') {
                    row.push(value);
                    value = "";
                } else if (char === '\n' || char === '\r') {
                    if (char === '\r' && text[i+1] === '\n') {
                        i++; // skip \n
                    }
                    row.push(value);
                    ret.push(row);
                    row = [];
                    value = "";
                } else {
                    value += char;
                }
                break;
            case 1:
                if (char === '"') {
                    if (i + 1 < text.length && text[i+1] === '"') {
                        value += '"';
                        i++;
                    } else {
                        state = 0;
                    }
                } else {
                    value += char;
                }
                break;
        }
    }
    if (value !== "" || row.length > 0) {
        row.push(value);
        ret.push(row);
    }
    return ret;
}

function displayResults(matches) {
    const table = document.getElementById('resultsTable');
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    matches.forEach(match => {
        const tr = document.createElement('tr');
        const tdTrack = document.createElement('td');
        tdTrack.textContent = match.trackName;
        const tdArtist = document.createElement('td');
        tdArtist.textContent = match.artistName;
        
        tr.appendChild(tdTrack);
        tr.appendChild(tdArtist);
        tbody.appendChild(tr);
    });

    table.style.display = matches.length > 0 ? 'table' : 'none';
    
    if (matches.length === 0) {
        document.getElementById('statusMessage').textContent = "No matching songs found in this file.";
    } else {
        document.getElementById('statusMessage').textContent = `Found ${matches.length} matching song(s)!`;
        document.getElementById('statusMessage').style.color = '#27ae60';
    }
}
