// Get references to the HTML elements
const searchInput = document.getElementById('searchInput');
const resultsBody = document.getElementById('resultsBody');
const resultsTable = document.getElementById('resultsTable');

let allData = []; // Array to hold all the parsed data from the CSV
let tableHeaders = []; // Array to hold the header names in order

// --- Event Listener ---
// Add an event listener to the search input that calls handleSearch on input
searchInput.addEventListener('input', handleSearch);

/**
 * Handles the search input event.
 * Filters data based on the query and updates the display.
 */
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    // console.log("Search query:", query); // Optional: for debugging

    if (!allData) { // Safety check in case data hasn't loaded
         console.warn("Data not loaded yet for searching.");
         return;
    }

    // Filter the allData array
    const filteredData = allData.filter(item => {
        // Check if *any* value within the current item object includes the query
        // Object.values(item) gets an array of the item's values (e.g., ['Ant-xxBTxx', 'B088KTG49', ...])
        return Object.values(item).some(value =>
            String(value).toLowerCase().includes(query) // Check if the string value contains the query
        );
    });

    // Display the filtered results using the existing display function
    displayData(filteredData);
}


/**
 * Fetches, parses, and initially displays the CSV data.
 */
async function loadAndDisplayData() {
    console.log("Starting loadAndDisplayData()...");
    try {
        console.log("Attempting to fetch data.csv...");
        const response = await fetch('data.csv');
        console.log("Fetch response received:", response);

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`, response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Fetch successful. Getting text content...");
        const csvText = await response.text();
        // console.log("CSV Text received (first 100 chars):", csvText.substring(0, 100)); // Can comment out if not needed

        console.log("Calling parseCSV()...");
        parseCSV(csvText);

        console.log("Calling displayData() for initial load...");
        displayData(allData); // Display all data initially
        console.log("Initial displayData() finished.");

    } catch (error) {
        console.error("ERROR caught in loadAndDisplayData():", error);
        resultsBody.innerHTML = `<tr><td colspan="4">Error loading data. Please check console.</td></tr>`;
    }
}

/**
 * Parses the raw CSV text into an array of objects.
 * Assumes the first row is headers.
 * @param {string} csvText - The raw text content of the CSV file.
 */
function parseCSV(csvText) {
    console.log("Starting parseCSV()...");
    allData = [];
    const lines = csvText.trim().split('\n');
    console.log(`CSV split into ${lines.length} lines.`);

    if (lines.length === 0) {
        console.warn("CSV file appears empty.");
        return;
    }

    tableHeaders = lines[0].split(',').map(header => header.trim());
    console.log("Parsed headers:", tableHeaders);

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === tableHeaders.length && lines[i].trim() !== '') {
            const rowObject = {};
            for (let j = 0; j < tableHeaders.length; j++) {
                rowObject[tableHeaders[j]] = values[j].trim();
            }
            allData.push(rowObject);
        } else if (lines[i].trim() !== '') {
            console.warn(`Skipping row ${i + 1}: Incorrect number of columns or malformed data.`);
        }
    }
    console.log(`Parsed ${allData.length} data rows.`);
    updateTableHeader();
    console.log("Finished parseCSV().");
}

/**
 * Dynamically updates the table's thead based on parsed headers.
 */
function updateTableHeader() {
     console.log("Updating table header...");
     const thead = resultsTable.querySelector('thead');
     if (!thead) return;

     thead.innerHTML = '';
     const headerRow = document.createElement('tr');
     tableHeaders.forEach(headerText => {
         const th = document.createElement('th');
         th.textContent = headerText;
         headerRow.appendChild(th);
     });
     thead.appendChild(headerRow);

     const errorRow = resultsBody.querySelector('td[colspan]');
     if (errorRow) {
         errorRow.colSpan = tableHeaders.length || 1;
     }
     // console.log("Table header updated."); // Can comment out if console gets too noisy
 }


/**
 * Displays an array of data objects in the HTML table.
 * @param {Array<Object>} dataArray - The array of data objects to display.
 */
function displayData(dataArray) {
    // console.log(`Starting displayData() with ${dataArray.length} items...`); // Can comment out
    resultsBody.innerHTML = ''; // Clear previous results

    if (dataArray.length === 0) {
        // console.log("No data to display for current filter."); // Can comment out
        resultsBody.innerHTML = `<tr><td colspan="${tableHeaders.length || 1}">No matching data found.</td></tr>`; // More specific message
        return;
    }

    // Loop through each data object in the (potentially filtered) array
    dataArray.forEach(item => {
        const row = document.createElement('tr');
        // Create a cell for each header value IN THE CORRECT ORDER
        tableHeaders.forEach(header => {
            const cell = document.createElement('td');
            cell.textContent = item[header] !== undefined ? item[header] : '';
            row.appendChild(cell);
        });
        resultsBody.appendChild(row); // Add the completed row to the table body
    });
    // console.log("Finished displayData()."); // Can comment out
}

// --- Initial Load ---
console.log("Script loaded. Starting initial data load...");
loadAndDisplayData(); // Load and display all data when the script runs