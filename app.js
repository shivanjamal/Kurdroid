// DOM elements
const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');
const categoriesContainer = document.getElementById('categoriesContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const noResultsMessage = document.getElementById('no-results-message');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const themeToggle = document.getElementById('themeToggle');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const updateNotification = document.getElementById('updateNotification');
const updateMessage = document.getElementById('updateMessage');
const closeUpdateNotification = document.getElementById('closeUpdateNotification');
const securityScanNotification = document.getElementById('securityScanNotification');
const securityScanMessage = document.getElementById('securityScanMessage');
const closeSecurityNotification = document.getElementById('closeSecurityNotification');
const privacyModal = document.getElementById('privacyModal');
const closePrivacyModal = document.getElementById('closePrivacyModal');
const privacyLink = document.getElementById('privacyLink');
const securityLink = document.getElementById('securityLink');

// Download Manager elements
const downloadManagerBtn = document.getElementById('downloadManagerBtn');
const downloadManagerModal = document.getElementById('downloadManagerModal');
const closeDownloadManagerModal = document.getElementById('closeDownloadManagerModal');
const downloadList = document.getElementById('downloadList');
const downloadCount = document.getElementById('downloadCount');
const emptyDownloadState = document.getElementById('emptyDownloadState');
const totalDownloads = document.getElementById('totalDownloads');
const totalSize = document.getElementById('totalSize');
const downloadTabs = document.querySelectorAll('.download-tab');
const pauseAllBtn = document.getElementById('pauseAllBtn');
const resumeAllBtn = document.getElementById('resumeAllBtn');
const importHistoryBtn = document.getElementById('importHistoryBtn');
const importFileInput = document.getElementById('importFileInput');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const clearDownloadsBtn = document.getElementById('clearDownloadsBtn');
const featuredAppContainer = document.getElementById('featuredAppContainer');
const featuredDownloadBtn = document.querySelector('.featured-download-btn');

// Share Modal elements
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const shareOptions = document.querySelectorAll('.share-option');
const confirmationModal = document.getElementById('confirmationModal');
const closeConfirmationModal = document.getElementById('closeConfirmationModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
const sortAppsDropdown = document.getElementById('sortApps');

// App Details Modal elements
const appDetailsModal = document.getElementById('appDetailsModal');
const closeAppDetailsModal = document.getElementById('closeAppDetailsModal');
const appDetailsTitle = document.getElementById('appDetailsTitle');
const appDetailsImage = document.getElementById('appDetailsImage');
const appDetailsName = document.getElementById('appDetailsName');
const appDetailsRating = document.getElementById('appDetailsRating');
const appDetailsTabs = document.querySelectorAll('.app-details-tab');
const appDetailsLastUpdated = document.getElementById('appDetailsLastUpdated');
const appDetailsDescription = document.getElementById('appDetailsDescription');
const appDetailsWhatsNew = document.getElementById('appDetailsWhatsNew');
const appDetailsDownloadBtn = document.getElementById('appDetailsDownloadBtn');
const appDetailsShareBtn = document.getElementById('appDetailsShareBtn');
const reportIssueBtn = document.getElementById('reportIssueBtn');
const copyDescriptionBtn = document.getElementById('copyDescriptionBtn');
const appDetailsSize = document.getElementById('appDetailsSize');

// Remove Favorite Modal elements
const removeFavoriteModal = document.getElementById('removeFavoriteModal');
const closeRemoveFavoriteModal = document.getElementById('closeRemoveFavoriteModal');
const confirmRemoveFavoriteBtn = document.getElementById('confirmRemoveFavoriteBtn');
const cancelRemoveFavoriteBtn = document.getElementById('cancelRemoveFavoriteBtn');

// Add App Modal elements
const addAppBtn = document.getElementById('addAppBtn');
const addAppModal = document.getElementById('addAppModal');
const closeAddAppModal = document.getElementById('closeAddAppModal');
const addAppForm = document.getElementById('addAppForm');
const generatedJsonContainer = document.getElementById('generatedJsonContainer');
const generatedJsonOutput = document.getElementById('generatedJsonOutput');
const copyJsonBtn = document.getElementById('copyJsonBtn');

// --- CONFIGURATION ---
const APP_UPLOAD_BASE_URL = "https://kurdroid.netlify.app/path/to/uploads/"; // **IMPORTANT**: Change this to your base URL

// State variables
let currentFilter = 'all';
let currentSearch = '';
let visibleApps = 8;
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
let currentAppToShare = null;
let downloadIdToDelete = null; // To store the ID of the download to be deleted
let currentSort = 'default';
let appNameToUnfavorite = null; // To store the app name to be unfavorited

// Search History state
let searchHistory = JSON.parse(localStorage.getItem('kurdroid_searchHistory')) || [];

// Favorites state
let favorites = JSON.parse(localStorage.getItem('kurdroid_favorites')) || [];

// Download manager state
let downloads = JSON.parse(localStorage.getItem('kurdroid_downloads')) || [];
let activeDownloads = [];

// Function to download file directly
function downloadFile(url, filename) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename || url.split('/').pop();
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

// Generic download handler
function handleDownload(app) {
    // Add to download manager
    const downloadId = addToDownloadManager(app, app.link);
    // Simulate download progress
    simulateDownloadProgress(downloadId);
    // Download the file directly
    downloadFile(app.link, `${app.name}.apk`);
    showToast('داگرتن دەستیپێکرد!');
}


// Initialize download manager
function initDownloadManager() {
    updateDownloadBadge();
    updateDownloadStats();

    // Set up event listeners for download manager
    downloadManagerBtn.addEventListener('click', () => {
        downloadManagerModal.classList.add('active');
        renderDownloadList('active');
    });

    closeDownloadManagerModal.addEventListener('click', () => {
        downloadManagerModal.classList.remove('active');
    });

    // Tab switching
    downloadTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            downloadTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderDownloadList(tab.getAttribute('data-tab'));
        });
    });

    // Close modal when clicking outside
    downloadManagerModal.addEventListener('click', (e) => {
        if (e.target === downloadManagerModal) {
            downloadManagerModal.classList.remove('active');
        }
    });

    // Clear downloads button
    clearDownloadsBtn.addEventListener('click', () => {
        clearDownloadsModal.classList.add('active');
    });

    // Pause All button
    pauseAllBtn.addEventListener('click', () => {
        pauseAllDownloads();
    });

    // Resume All button
    resumeAllBtn.addEventListener('click', () => {
        resumeAllDownloads();
    });

    // Import History button
    importHistoryBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) importDownloadHistory(file);
    });

    // Export CSV button
    exportCsvBtn.addEventListener('click', () => {
        exportDownloadHistoryCSV();
    });
}

// Add download to manager
function addToDownloadManager(app, link) {
    const downloadId = Date.now().toString();
    const download = {
        id: downloadId,
        appId: app.name,
        name: app.name,
        image: app.img,
        link: link,
        progress: 0,
        status: 'downloading', // downloading, completed, failed, paused
        date: new Date().toISOString(),
        size: Math.floor(Math.random() * 500) + 50, // Random size between 50-550MB
        speed: 0 // Initial speed
    };

    downloads.unshift(download);
    activeDownloads.push(downloadId);

    // Save to localStorage
    localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));

    updateDownloadBadge();
    updateDownloadStats();

    // If download manager is open, update the list
    if (downloadManagerModal.classList.contains('active')) {
        renderDownloadList('active');
    }

    return downloadId;
}

// Update download progress
function updateDownloadProgress(downloadId, progress) {
    const downloadIndex = downloads.findIndex(d => d.id === downloadId);
    if (downloadIndex !== -1) {
        downloads[downloadIndex].progress = progress;
        downloads[downloadIndex].speed = progress < 100 ? (Math.random() * 2.5 + 0.5).toFixed(1) : 0; // Simulate speed

        if (progress === 100) {
            downloads[downloadIndex].status = 'completed';
            const activeIndex = activeDownloads.indexOf(downloadId);
            if (activeIndex !== -1) {
                activeDownloads.splice(activeIndex, 1);
            }
        }

        localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));

        // If download manager is open, update the list
        if (downloadManagerModal.classList.contains('active')) {
            renderDownloadList(document.querySelector('.download-tab.active').dataset.tab);
        }

        updateDownloadBadge();
        updateDownloadStats();
    }
}

// Update download badge count
function updateDownloadBadge() {
    const activeCount = downloads.filter(d => d.status === 'downloading' || d.status === 'paused').length;
    downloadCount.textContent = activeCount;
    downloadCount.style.display = activeCount > 0 ? 'flex' : 'none';
}

// Update download statistics
function updateDownloadStats() {
    totalDownloads.textContent = downloads.length;

    const totalSizeMB = downloads.reduce((total, download) => {
        return total + (download.status === 'completed' ? download.size : 0);
    }, 0);

    totalSize.textContent = `${totalSizeMB} MB`;
}

// Render download list based on tab
function renderDownloadList(tab) {
    let filteredDownloads = [];

    switch (tab) {
        case 'active':
            filteredDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'paused');
            break;
        case 'completed':
            filteredDownloads = downloads.filter(d => d.status === 'completed');
            break;
        case 'failed':
            filteredDownloads = downloads.filter(d => d.status === 'failed');
            break;
    }

    if (filteredDownloads.length === 0) {
        emptyDownloadState.style.display = 'block';
        downloadList.innerHTML = '';
        downloadList.appendChild(emptyDownloadState);
        return;
    }

    emptyDownloadState.style.display = 'none';
    downloadList.innerHTML = '';

    filteredDownloads.forEach(download => {
        const downloadItem = createDownloadItem(download);
        downloadList.appendChild(downloadItem);
    });
}

// Create download item element
function createDownloadItem(download) {
    const item = document.createElement('div');
    item.className = 'download-item';
    item.setAttribute('data-id', download.id);

    const statusIcon = download.status === 'completed' ? 'fa-check-circle' :
        download.status === 'failed' ? 'fa-exclamation-circle' :
            download.status === 'paused' ? 'fa-pause-circle' : 'fa-download';

    const statusColor = download.status === 'completed' ? 'var(--success-color)' :
        download.status === 'failed' ? 'var(--danger-color)' :
            download.status === 'paused' ? 'var(--warning-color)' : 'var(--primary-color)';

    item.innerHTML = `
        <i class="fas ${statusIcon} download-status-icon" style="color: ${statusColor}"></i>
        <img src="${download.image}" alt="${download.name}" class="download-item-image">
        <div class="download-item-info">
            <div class="download-item-name">${download.name}</div>
            <div class="download-item-details">
                <span>${download.size} MB</span>
                ${download.status === 'downloading' ? `<span><i class="fas fa-arrow-down"></i> ${download.speed} MB/s</span>` : ''}
                <span>${formatDate(download.date)}</span>
            </div>
            ${download.status !== 'completed' && download.status !== 'failed' ? `
            <div class="download-progress-bar">
                <div class="download-progress-fill" style="width: ${download.progress}%"></div>
            </div>
            ` : ''}
        </div>
        <div class="download-actions">
            ${download.status === 'downloading' ? `
            <button class="download-action-btn pause-download" title="پشوو">
                <i class="fas fa-pause"></i>
            </button>
            ` : ''}
            ${download.status === 'paused' ? `
            <button class="download-action-btn resume-download" title="دەستپێکرنڤە">
                <i class="fas fa-play"></i>
            </button>
            ` : ''}
            ${download.status === 'failed' ? `
            <button class="download-action-btn retry-download" title="دووبارە">
                <i class="fas fa-sync-alt"></i>
            </button>
            ` : ''}
            <button class="download-action-btn delete-download" title="ژئبرن">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add event listeners for action buttons
    const deleteBtn = item.querySelector('.delete-download');
    deleteBtn.addEventListener('click', () => {
        showDeleteConfirmation(download.id); // Show confirmation modal
    });

    if (download.status === 'downloading') {
        const pauseBtn = item.querySelector('.pause-download');
        pauseBtn.addEventListener('click', () => {
            pauseDownload(download.id);
        });
    }

    if (download.status === 'paused') {
        const resumeBtn = item.querySelector('.resume-download');
        resumeBtn.addEventListener('click', () => {
            resumeDownload(download.id);
        });
    }

    if (download.status === 'failed') {
        const retryBtn = item.querySelector('.retry-download');
        retryBtn.addEventListener('click', () => {
            retryDownload(download.id);
        });
    }

    return item;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ku');
}

// Pause download
function pauseDownload(downloadId) {
    const downloadIndex = downloads.findIndex(d => d.id === downloadId);
    if (downloadIndex !== -1) {
        downloads[downloadIndex].status = 'paused';
        downloads[downloadIndex].speed = 0;
        localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));
        renderDownloadList('active');
    }
}

// Resume download
function resumeDownload(downloadId) {
    const downloadIndex = downloads.findIndex(d => d.id === downloadId);
    if (downloadIndex !== -1) {
        downloads[downloadIndex].status = 'downloading';
        localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));
        renderDownloadList('active');

        // Simulate download progress for demo
        simulateDownloadProgress(downloadId);
    }
}

// Pause all active downloads
function pauseAllDownloads() {
    downloads.forEach(d => {
        if (d.status === 'downloading') {
            d.status = 'paused';
        }
    });
    localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));
    renderDownloadList('active');
}

// Resume all paused downloads
function resumeAllDownloads() {
    downloads.forEach(d => {
        if (d.status === 'paused') {
            resumeDownload(d.id);
        }
    });
}

// Retry a failed download
function retryDownload(downloadId) {
    const downloadIndex = downloads.findIndex(d => d.id === downloadId);
    if (downloadIndex !== -1) {
        downloads[downloadIndex].status = 'downloading';
        downloads[downloadIndex].progress = 0;
        localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));
        renderDownloadList('active');
        
        simulateDownloadProgress(downloadId);
    }
}

// Show delete confirmation modal
function showDeleteConfirmation(downloadId) {
    downloadIdToDelete = downloadId;
    confirmationModal.classList.add('active');
}

// Delete download
function deleteDownload(downloadId) {
    downloads = downloads.filter(d => d.id !== downloadId);
    localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));

    const activeIndex = activeDownloads.indexOf(downloadId);
    if (activeIndex !== -1) {
        activeDownloads.splice(activeIndex, 1);
    }

    updateDownloadBadge();
    updateDownloadStats();
    renderDownloadList('active');
    confirmationModal.classList.remove('active'); // Hide modal after deletion
}

// Clear completed and failed downloads
function clearDownloadHistory() {
    // Keep only downloads that are 'downloading' or 'paused'
    downloads = downloads.filter(d => d.status === 'downloading' || d.status === 'paused');
    localStorage.setItem('kurdroid_downloads', JSON.stringify(downloads));
    updateDownloadBadge();
    updateDownloadStats();
    renderDownloadList(document.querySelector('.download-tab.active').dataset.tab);
    clearDownloadsModal.classList.remove('active');
}

// Export download history as a .csv file
function exportDownloadHistoryCSV() {
    if (downloads.length === 0) {
        showToast("مێژووی داگرتن بەتاڵە!");
        return;
    }

    const headers = ["Name", "Status", "Date", "Size (MB)", "Link"];
    let csvContent = headers.join(",") + "\n";

    const escapeCsvField = (field) => {
        const stringField = String(field || '');
        if (stringField.includes(',')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    downloads.forEach(d => {
        const row = [d.name, d.status, formatDate(d.date), d.size, d.link];
        csvContent += row.map(escapeCsvField).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'kurdroid_downloads.csv');
    URL.revokeObjectURL(url); // Clean up
}

// Import download history from a .csv file
function importDownloadHistory(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;
        const lines = csv.split('\n').slice(1); // Skip header row
        let importedCount = 0;

        lines.forEach(line => {
            if (line.trim() === '') return;
            const values = line.split(',');
            const appName = values[0].replace(/"/g, '');

            // Check if app exists in our database
            const app = appData.find(a => a.name === appName);
            if (app) {
                // Avoid adding duplicates
                const alreadyExists = downloads.some(d => d.name === appName);
                if (!alreadyExists) {
                    handleDownload(app); // Start the download for the imported app
                    importedCount++;
                }
            }
        });
        showToast(`${importedCount} داگرتن هاتنە زێدەکرن.`);
    };
    reader.readAsText(file);
}

// Simulate download progress for demo purposes
function simulateDownloadProgress(downloadId) {
    let progress = downloads.find(d => d.id === downloadId).progress;

    const interval = setInterval(() => {
        progress += 5;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }

        updateDownloadProgress(downloadId, progress);
    }, 500);
}

// Share app function
function shareApp(app, method) {
    const appName = encodeURIComponent(app.name);
    const appLink = encodeURIComponent(app.link);
    const shareText = encodeURIComponent(`سەحدکرنا ئەپی ${app.name} لە Kurdroid`);

    let shareUrl = '';

    switch (method) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${appLink}&quote=${shareText}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${appLink}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${shareText} ${appLink}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${appLink}&text=${shareText}`;
            break;
        case 'link':
            // For link copying, we'll handle it separately
            shareLinkInput.value = app.link;
            navigator.clipboard.writeText(app.link).then(() => {
                showToast('لینک هاتە کۆپیکرن!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showToast('کۆپیکرن سەرکەوتوو نەبوو');
            });
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank');
        showToast('ئەپەکە هاتە پارڤەکرن.!');
    }
}

// Toggle Favorite
function toggleFavorite(appName, button) {
    const appIndex = favorites.indexOf(appName);

    if (appIndex > -1) {
        // App is already a favorite, so show confirmation to remove
        appNameToUnfavorite = appName;
        removeFavoriteModal.classList.add('active');
    } else {
        favorites.push(appName); // Add to favorites
        button.classList.add('favorited');
        button.innerHTML = '<i class="fas fa-heart"></i>';
        localStorage.setItem('kurdroid_favorites', JSON.stringify(favorites));
    }
}

// Actually remove the favorite after confirmation
function removeFavorite() {
    if (!appNameToUnfavorite) return;

    const appIndex = favorites.indexOf(appNameToUnfavorite);
    if (appIndex > -1) {
        favorites.splice(appIndex, 1);
        localStorage.setItem('kurdroid_favorites', JSON.stringify(favorites));
        renderApps(); // Re-render to update the UI
    }
    removeFavoriteModal.classList.remove('active');
    appNameToUnfavorite = null;
}

// Show App Details Modal
function showAppDetails(app) {
    appDetailsImage.src = app.img;
    appDetailsName.textContent = app.name;
    appDetailsDescription.textContent = app.description || "No description available.";
    
    // Reset to default tab
    document.querySelector('.app-details-tab[data-tab="description"]').click();


    if (app.lastUpdated) {
        appDetailsLastUpdated.innerHTML = `<i class="fas fa-calendar-alt"></i> نوێکرایەوە لە: ${formatDate(app.lastUpdated)}`;
        appDetailsLastUpdated.style.display = 'block';
    } else {
        appDetailsLastUpdated.style.display = 'none';
    }

    if (app.size) {
        appDetailsSize.innerHTML = `<i class="fas fa-file-archive"></i> قەبارە: ${app.size}`;
        appDetailsSize.style.display = 'block';
    } else {
        appDetailsSize.style.display = 'none';
    }

    // Populate rating
    const fullStars = Math.floor(app.rating);
    const halfStar = app.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
    if (halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
    appDetailsRating.innerHTML = `<div class="stars">${starsHTML}</div> <span class="rating-count">(${formatNumber(app.reviews)})</span>`;

    // Populate "What's New"
    appDetailsWhatsNew.innerHTML = '';
    if (app.whatsNew && app.whatsNew.length > 0) {
        app.whatsNew.forEach(change => {
            const li = document.createElement('li');
            li.textContent = change;
            appDetailsWhatsNew.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "No recent changes listed.";
        appDetailsWhatsNew.appendChild(li);
    }

    // Set up download and share buttons
    appDetailsDownloadBtn.onclick = () => {
        handleDownload(app);
        appDetailsModal.classList.remove('active');
    };
    appDetailsShareBtn.onclick = () => {
        showShareModal(app);
    };

    // Set up report issue button
    const mailtoLink = `mailto:iamshvan@gmail.com?subject=Issue Report for: ${encodeURIComponent(app.name)}`;
    reportIssueBtn.href = mailtoLink;

    appDetailsModal.classList.add('active');
}


// Show share modal
function showShareModal(app) {
    currentAppToShare = app;
    shareLinkInput.value = app.link;
    shareModal.classList.add('active');
}

// Show toast notification with custom message
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show security scan notification
function showSecurityScanNotification() {
    const randomApp = appData[Math.floor(Math.random() * appData.length)];
    securityScanMessage.textContent = `پشکنینی ${randomApp.name} بۆ مەلەرێ ب سەرکەفتیانە ب دووماهی هات.`;
    securityScanNotification.classList.add('show');

    setTimeout(() => {
        securityScanNotification.classList.remove('show');
    }, 5000);
}

// Show update notification
function showUpdateNotification() {
    const randomApp = appData[Math.floor(Math.random() * appData.length)];
    updateMessage.textContent = `نووکرنەوەیەک بەردەستە بۆ ${randomApp.name}`;
    updateNotification.classList.add('show');

    setTimeout(() => {
        updateNotification.classList.remove('show');
    }, 5000);
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('darkTheme', isDarkTheme);
    applyTheme();
}

// Apply theme based on current state
function applyTheme() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Render categories
function renderCategories() {
    categoriesContainer.innerHTML = '';
    navData.forEach(item => {
        const button = document.createElement('button');
        button.className = `category-btn ${item.filter === currentFilter ? 'active' : ''}`;
        button.setAttribute('data-filter', item.filter);
        button.innerHTML = `<i class="${item.icon}"></i> ${item.label}`;
        categoriesContainer.appendChild(button);
    });
}

// Render apps based on filter and search
function renderApps() {
    loadingSpinner.style.display = 'block';
    appsGrid.style.display = 'none';
    noResultsMessage.style.display = 'none';
    loadMoreBtn.style.display = 'none';

    const filteredApps = filterApps();

    // Use a short timeout to ensure the spinner is visible before the heavy work of rendering begins.
    setTimeout(() => {
        loadingSpinner.style.display = 'none';

        if (filteredApps.length === 0) {
            noResultsMessage.style.display = 'block';
            appsGrid.innerHTML = ''; // Clear the grid
            return;
        }

        appsGrid.style.display = 'grid';
        appsGrid.innerHTML = '';

        filteredApps.slice(0, visibleApps).forEach((app, index) => {
            const appCard = createAppCard(app, index);
            lazyLoadObserver.observe(appCard.querySelector('.app-image'));
            appsGrid.appendChild(appCard);

            // Add animation delay for staggered appearance
            setTimeout(() => {
                appCard.classList.add('visible');
            }, index * 50);
        });

        // Show/hide load more button
        loadMoreBtn.style.display = filteredApps.length > visibleApps ? 'block' : 'none';
    }, 300); // A small delay to simulate loading and improve UX
}

// Filter apps based on current filter and search
function filterApps() {
    let filtered = appData.filter(app => {
        const matchesFilter = currentFilter === 'all' || app.category === currentFilter;
        if (currentFilter === 'favorites') return favorites.includes(app.name);
        if (currentFilter === 'updates') return app.hasUpdate;
        const matchesSearch = app.name.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Apply sorting
    switch (currentSort) {
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'ku')); // Kurdish locale for correct sorting
            break;
        case 'rating-desc':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'updated-desc':
            filtered.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
            break;
        case 'default':
        default:
            // No sorting or default order
            break;
    }
    return filtered;
}

// Create an app card element
function createAppCard(app, index) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.style.animationDelay = `${index * 0.1}s`;

    // Generate star rating HTML
    const fullStars = Math.floor(app.rating);
    const halfStar = app.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    const isFavorited = favorites.includes(app.name);

    card.innerHTML = `
        ${app.verified ? '<div class="security-badge"><i class="fas fa-shield-alt"></i> پشکنین کریە</div>' : ''}
        ${app.hasUpdate ? '<div class="update-badge pulse"><i class="fas fa-arrow-up"></i> نوێ</div>' : ''}
        <img data-src="${app.img}" alt="${app.name}" class="app-image">
        <div class="app-content">
            <h3 class="app-name">${app.name}</h3>
            <p class="app-category">${getCategoryLabel(app.category)}</p>
            <div class="app-rating">
                <div class="stars">${starsHTML}</div>
                <span class="rating-count">(${formatNumber(app.reviews)})</span>
            </div>
            <div class="card-actions">
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-app-name="${app.name}">
                            <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                <button class="download-btn" data-link="${app.link}" data-name="${app.name}">
                    <i class="fas fa-download"></i>
                    <span>داگرتن</span>
                    <div class="download-progress"></div>
                </button>
                <button class="share-btn" data-app="${app.name}">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `;

    // Add event listener to the card itself to open the details modal
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.download-btn') && !e.target.closest('.share-btn') && !e.target.closest('.favorite-btn')) {
            showAppDetails(app);
        }
    });
    return card;
}

// Render recommendations
function renderRecommendations() {
    recommendationsContainer.innerHTML = '';

    // Get 4 random apps for recommendations
    const shuffledApps = [...appData].sort(() => 0.5 - Math.random());
    const selectedApps = shuffledApps.slice(0, 4);

    selectedApps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <img data-src="${app.img}" alt="${app.name}" class="recommendation-image app-image">
            <div class="recommendation-content">
                <h3 class="recommendation-name">${app.name}</h3>
            </div>
        `;

        card.addEventListener('click', () => {
            showAppDetails(app);
            lazyLoadObserver.observe(card.querySelector('.app-image'));
        });

        recommendationsContainer.appendChild(card);
    });
}

// Get category label
function getCategoryLabel(category) {
    const categoryItem = navData.find(item => item.filter === category);
    return categoryItem ? categoryItem.label : category;
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

// --- Search History Functions ---

function renderSearchHistory() {
    const historyContainer = document.getElementById('searchHistoryContainer');
    historyContainer.innerHTML = '';

    if (searchHistory.length > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-history-btn';
        clearBtn.innerHTML = '<i class="fas fa-times"></i> سڕینەوەی مێژوو';
        clearBtn.onclick = clearSearchHistory;
        historyContainer.appendChild(clearBtn);
    }

    searchHistory.forEach(term => {
        const tag = document.createElement('span');
        tag.className = 'history-tag';
        tag.textContent = term;
        tag.onclick = () => {
            searchInput.value = term;
            currentSearch = term;
            renderApps();
        };
        historyContainer.appendChild(tag);
    });
}

function addToSearchHistory(term) {
    if (!term || term.length < 2) return;
    // Remove term if it already exists to move it to the front
    searchHistory = searchHistory.filter(t => t.toLowerCase() !== term.toLowerCase());
    searchHistory.unshift(term); // Add to the beginning
    searchHistory = searchHistory.slice(0, 5); // Keep only the 5 most recent searches
    localStorage.setItem('kurdroid_searchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
}

function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem('kurdroid_searchHistory');
    renderSearchHistory();
}

// Setup event listeners
function setupEventListeners() {
    // Category filter
    categoriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn') || e.target.parentElement.classList.contains('category-btn')) {
            const button = e.target.classList.contains('category-btn') ? e.target : e.target.parentElement;
            const filter = button.getAttribute('data-filter');

            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            // Update filter and render apps
            currentFilter = filter;
            visibleApps = 8;
            renderApps();
        }
    });

    // Search input
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = searchInput.value;
            visibleApps = 8;
            renderApps();
            addToSearchHistory(currentSearch.trim());
        }, 500); // Debounce search to avoid too many re-renders
    });

    // Initial render of search history
    renderSearchHistory();


    // Sort dropdown
    sortAppsDropdown.addEventListener('change', () => {
        currentSort = sortAppsDropdown.value;
        renderApps();
    });

    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        visibleApps += 8;
        renderApps();
    });

    // Download buttons
    document.body.addEventListener('click', (e) => {
        const downloadButton = e.target.closest('.download-btn');
        if (downloadButton && !downloadButton.id.includes('appDetails')) {
            // Find the app data
            const appCard = downloadButton.closest('.app-card');
            const appNameText = appCard.querySelector('.app-name').textContent;
            const app = appData.find(a => a.name === appNameText);
            
            if (app) {
                handleDownload(app);
                // Simulate download progress in button
                const progressBar = downloadButton.querySelector('.download-progress');
                progressBar.style.width = '0%';
                
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 5;
                    progressBar.style.width = `${progress}%`;
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        showToast('داگرتن ب دوماهی هات!');
                        // Reset progress after a delay
                        setTimeout(() => {
                            progressBar.style.width = '0%';
                        }, 1000);
                    }
                }, 50);
            }
        }

        // Favorite buttons
        const favoriteButton = e.target.closest('.favorite-btn');
        if (favoriteButton) {
            const appName = favoriteButton.dataset.appName;
            if (appName) {
                toggleFavorite(appName, favoriteButton);
            }
        }

        // Share buttons
        const shareButton = e.target.closest('.share-btn');
        if (shareButton && !shareButton.id.includes('appDetails')) {
            const button = shareButton;
            const appName = button.getAttribute('data-app');
            const app = appData.find(a => a.name === appName);

            if (app) {
                showShareModal(app);
            }
        }

        // Featured app download button
        if (e.target.closest('.featured-download-btn')) {
            const app = appData.find(a => a.name === "PUBG Mobile");
            if (app) {
                handleDownload(app);
                showToast('داگرتن دەستیپێکرد!');
            }
        }
    });

    // Share options
    shareOptions.forEach(option => {
        option.addEventListener('click', () => {
            const method = option.getAttribute('data-method');
            if (currentAppToShare) {
                shareApp(currentAppToShare, method);
                shareModal.classList.remove('active');
            }
        });
    });

    // Copy link button
    copyLinkBtn.addEventListener('click', () => {
        const linkToCopy = shareLinkInput.value;
        navigator.clipboard.writeText(linkToCopy).then(() => {
            showToast('لینک هاتە کۆپیکرن!');
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            showToast('کۆپیکرن سەرکەوتوو نەبوو');
        });
    });

    // Close share modal
    closeShareModal.addEventListener('click', () => {
        shareModal.classList.remove('active');
    });

    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('active');
        }
    });

    // App Details Modal Tabs
    appDetailsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Update active tab button
            appDetailsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content panel
            document.querySelectorAll('.app-details-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-content`).classList.add('active');
        });
    });

    // Confirmation modal actions
    confirmDeleteBtn.addEventListener('click', () => {
        if (downloadIdToDelete) {
            deleteDownload(downloadIdToDelete);
            downloadIdToDelete = null; // Reset
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('active');
        downloadIdToDelete = null; // Reset
    });

    closeConfirmationModal.addEventListener('click', () => {
        confirmationModal.classList.remove('active');
        downloadIdToDelete = null; // Reset
    });

    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.classList.remove('active');
            downloadIdToDelete = null; // Reset
        }
    });

    // Add App Modal Listeners
    addAppBtn.addEventListener('click', () => {
        addAppModal.classList.add('active');
        generatedJsonContainer.style.display = 'none';
        addAppForm.reset();
    });

    closeAddAppModal.addEventListener('click', () => {
        addAppModal.classList.remove('active');
    });

    addAppModal.addEventListener('click', (e) => {
        if (e.target === addAppModal) {
            addAppModal.classList.remove('active');
        }
    });

    addAppForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const imgFile = document.getElementById('newAppImg').files[0];
        const apkFile = document.getElementById('newAppFile').files[0];

        const newApp = {
            name: document.getElementById('newAppName').value,
            category: document.getElementById('newAppCategory').value,
            img: `${APP_UPLOAD_BASE_URL}images/${imgFile.name}`,
            link: `${APP_UPLOAD_BASE_URL}apks/${apkFile.name}`,
            rating: 0,
            reviews: 0,
            verified: true,
            lastScanned: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0],
            size: document.getElementById('newAppSize').value,
            description: "",
            whatsNew: []
        };

        generatedJsonOutput.value = JSON.stringify(newApp, null, 4);
        generatedJsonContainer.style.display = 'block';
    });

    copyJsonBtn.addEventListener('click', () => {
        generatedJsonOutput.select();
        navigator.clipboard.writeText(generatedJsonOutput.value).then(() => {
            showToast('کۆدی JSON هاتە کۆپیکرن!');
        });
    });

    // Remove Favorite Modal listeners
    confirmRemoveFavoriteBtn.addEventListener('click', removeFavorite);

    cancelRemoveFavoriteBtn.addEventListener('click', () => {
        removeFavoriteModal.classList.remove('active');
        appNameToUnfavorite = null;
    });

    closeRemoveFavoriteModal.addEventListener('click', () => {
        removeFavoriteModal.classList.remove('active');
        appNameToUnfavorite = null;
    });

    removeFavoriteModal.addEventListener('click', (e) => {
        if (e.target === removeFavoriteModal) {
            removeFavoriteModal.classList.remove('active');
            appNameToUnfavorite = null;
        }
    });

    // Copy description button
    copyDescriptionBtn.addEventListener('click', () => {
        const descriptionText = appDetailsDescription.textContent;
        navigator.clipboard.writeText(descriptionText).then(() => {
            showToast('دەق هاتە کۆپیکرن!');
        }).catch(err => {
            console.error('Failed to copy description: ', err);
            showToast('کۆپیکرن سەرکەوتوو نەبوو');
        });
    });

    // App Details Modal
    closeAppDetailsModal.addEventListener('click', () => {
        appDetailsModal.classList.remove('active');
    });

    appDetailsModal.addEventListener('click', (e) => {
        if (e.target === appDetailsModal) {
            appDetailsModal.classList.remove('active');
        }
    });

    // Scroll to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Close update notification
    closeUpdateNotification.addEventListener('click', () => {
        updateNotification.classList.remove('show');
    });

    // Close security notification
    closeSecurityNotification.addEventListener('click', () => {
        securityScanNotification.classList.remove('show');
    });

    // Show update notification after 5 seconds
    setTimeout(() => {
        showUpdateNotification();
    }, 7000);

    // Privacy policy modal
    privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.add('active');
    });

    securityLink.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.add('active');
    });

    closePrivacyModal.addEventListener('click', () => {
        privacyModal.classList.remove('active');
    });

    // Close modal when clicking outside
    privacyModal.addEventListener('click', (e) => {
        if (e.target === privacyModal) {
            privacyModal.classList.remove('active');
        }
    });
}

// Lazy Loading for images
let lazyLoadObserver;

function initLazyLoading() {
    lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => {
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                };
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '0px 0px 200px 0px' // Start loading images 200px before they enter the viewport
    });
}


// Data variables that will be populated from JSON
let appData = [];
let navData = [];

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        appData = data.appData;
        navData = data.navData;
    } catch (error) {
        console.error("Could not fetch app data:", error);
        document.body.innerHTML = '<h1 style="text-align: center; padding: 50px;">Could not load app data. Please try again later.</h1>';
        return;
    }

    renderCategories();
    renderApps();
    renderRecommendations();
    setupEventListeners();
    applyTheme();
    initLazyLoading();
    initDownloadManager();
});