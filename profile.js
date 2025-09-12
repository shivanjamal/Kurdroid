document.addEventListener('DOMContentLoaded', () => {
    const reviewsCountEl = document.getElementById('reviewsCount');
    const favoritesCountEl = document.getElementById('favoritesCount');
    const myReviewsListEl = document.getElementById('myReviewsList');
    const myFavoritesListEl = document.getElementById('myFavoritesList');
    const themeToggle = document.getElementById('themeToggle');
    const profileNameEl = document.querySelector('.profile-name');
    const profileBioEl = document.querySelector('.profile-bio');
    const profileSocialsEl = document.getElementById('profileSocials');
    const avatarContainer = document.getElementById('avatarContainer');
    const avatarImg = avatarContainer.querySelector('img');
    const avatarUploadInput = document.getElementById('avatarUpload');
    const coverPhotoContainer = document.getElementById('coverPhotoContainer');
    const coverPhotoImg = document.getElementById('coverPhotoImg');
    const editCoverBtn = document.getElementById('editCoverBtn');
    const coverPhotoUploadInput = document.getElementById('coverPhotoUpload');
    const deleteReviewModal = document.getElementById('deleteReviewModal');
    const closeDeleteReviewModal = document.getElementById('closeDeleteReviewModal');
    const confirmDeleteReviewBtn = document.getElementById('confirmDeleteReviewBtn');
    const cancelDeleteReviewBtn = document.getElementById('cancelDeleteReviewBtn');


    // --- DATA ---
    const reviews = JSON.parse(localStorage.getItem('kurdroid_reviews')) || {};
    const favorites = JSON.parse(localStorage.getItem('kurdroid_favorites')) || [];
    let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    let userProfile = JSON.parse(localStorage.getItem('kurdroid_userProfile')) || {
        name: 'iamshvan',
        bio: 'App enthusiast and tech reviewer. Discovering the best apps for Android.',
        avatar: 'https://i.pravatar.cc/150?u=iamshvan',
        cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop',
        socials: {
            facebook: 'https://facebook.com',
            twitter: 'https://twitter.com',
            instagram: 'https://instagram.com',
            website: ''
        }
    };
    let reviewToDelete = null; // Store the actual review object for undo
    let deleteTimeout = null; // To manage the permanent deletion

    // --- TOAST for profile page ---
    const toast = document.getElementById('toast');
    const profileToastMessage = toast.querySelector('#toastMessage');
    const profileToastActionBtn = toast.querySelector('#toastActionBtn');
    const profileToastIcon = toast.querySelector('i');



    // --- FUNCTIONS ---

    function applyTheme() {
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        localStorage.setItem('darkTheme', isDarkTheme);
        applyTheme();
    }

    function getStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
        }
        return html;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function renderProfileInfo() {
        profileNameEl.textContent = userProfile.name;
        profileBioEl.textContent = userProfile.bio;
        avatarImg.src = userProfile.avatar;
        coverPhotoImg.src = userProfile.cover;
        renderSocialLinks();
    }

    function renderSocialLinks() {
        profileSocialsEl.innerHTML = '';
        if (userProfile.socials) {
            if (userProfile.socials.facebook) {
                profileSocialsEl.innerHTML += `<a href="${userProfile.socials.facebook}" target="_blank" class="social-link" title="Facebook"><i class="fab fa-facebook-square"></i></a>`;
            }
            if (userProfile.socials.twitter) {
                profileSocialsEl.innerHTML += `<a href="${userProfile.socials.twitter}" target="_blank" class="social-link" title="Twitter"><i class="fab fa-twitter-square"></i></a>`;
            }
            if (userProfile.socials.instagram) {
                profileSocialsEl.innerHTML += `<a href="${userProfile.socials.instagram}" target="_blank" class="social-link" title="Instagram"><i class="fab fa-instagram-square"></i></a>`;
            }
            if (userProfile.socials.website) {
                profileSocialsEl.innerHTML += `<a href="${userProfile.socials.website}" target="_blank" class="social-link" title="Website"><i class="fas fa-globe"></i></a>`;
            }
        }
    }

    function renderMyReviews() {
        // For this demo, we'll assume all reviews belong to the current user.
        const allReviews = Object.entries(reviews).flatMap(([appName, appReviews]) => 
            appReviews.map(review => ({ ...review, appName }))
        );

        reviewsCountEl.textContent = allReviews.length;

        if (allReviews.length === 0) {
            myReviewsListEl.innerHTML = '<p>You haven\'t written any reviews yet.</p>';
            return;
        }

        allReviews.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent

        myReviewsListEl.innerHTML = '';
        allReviews.forEach((review, index) => {
            const reviewEl = document.createElement('div');
            reviewEl.className = 'review-item';
            // Use a unique identifier for the review, like its index in the sorted array combined with appName
            const reviewId = `${review.appName}-${review.date}`;
            reviewEl.innerHTML = `
                <div class="review-header">
                    <span class="review-author">You reviewed <strong>${review.appName}</strong></span>
                    <div class="stars">${getStarsHTML(review.rating)}</div>
                    <button class="btn-delete-review" data-review-id="${reviewId}"><i class="fas fa-trash-alt"></i></button>
                </div>
                <p class="review-body">"${review.text}"</p>
                <span class="review-date">on ${formatDate(review.date)}</span>
            `;
            myReviewsListEl.appendChild(reviewEl);
        });
    }

    function renderMyFavorites() {
        favoritesCountEl.textContent = favorites.length;

        if (favorites.length === 0) {
            myFavoritesListEl.innerHTML = '<p>You haven\'t added any apps to your favorites yet.</p>';
            return;
        }

        myFavoritesListEl.innerHTML = '';
        favorites.forEach(app => {
            // A simplified card for the profile page
            const card = document.createElement('div');
            card.className = 'app-card visible';
            card.innerHTML = `
                <a href="/?app=${encodeURIComponent(app.name)}" style="text-decoration: none; color: inherit;">
                    <img src="${app.img}" alt="${app.name}" class="app-image loaded">
                    <div class="app-content">
                        <h3 class="app-name">${app.name}</h3>
                    </div>
                </a>`;
            myFavoritesListEl.appendChild(card);
        });
    }

    function showDeleteReviewConfirmation(reviewId) {
        const [appName, date] = reviewId.split(/-(.*)/s);
        const reviewIndex = reviews[appName]?.findIndex(r => r.date === date);

        if (reviewIndex > -1) {
            // Store the review to be deleted for the undo action
            reviewToDelete = { ...reviews[appName][reviewIndex], appName };

            // Temporarily remove from view and show undo toast
            const reviewItem = myReviewsListEl.querySelector(`[data-review-id="${reviewId}"]`).closest('.review-item');
            reviewItem.style.display = 'none';

            showUndoToast('Review deleted.', () => {
                reviewItem.style.display = 'block'; // Restore view on undo
                reviewToDelete = null; // Cancel deletion
            });
        }
    }

    function showUndoToast(message, onUndo) {
        clearTimeout(deleteTimeout); // Clear any pending deletion

        profileToastMessage.textContent = message;
        profileToastIcon.className = 'fas fa-trash-alt';
        profileToastActionBtn.textContent = 'Undo';
        profileToastActionBtn.style.display = 'block';
        
        const undoHandler = () => {
            onUndo();
            toast.classList.remove('show');
            profileToastActionBtn.removeEventListener('click', undoHandler);
            clearTimeout(deleteTimeout);
        };

        profileToastActionBtn.addEventListener('click', undoHandler);

        toast.classList.add('show');

        // Set a timeout to permanently delete if not undone
        deleteTimeout = setTimeout(() => {
            permanentlyDeleteReview();
            toast.classList.remove('show');
            profileToastActionBtn.removeEventListener('click', undoHandler);
        }, 5000); // 5 seconds to undo
    }

    function permanentlyDeleteReview() {
        if (!reviewToDelete) return;

        const { appName, date } = reviewToDelete;
        
        if (reviews[appName]) {
            const reviewIndex = reviews[appName].findIndex(r => r.date === date);
            if (reviewIndex > -1) {
                reviews[appName].splice(reviewIndex, 1);
                if (reviews[appName].length === 0) {
                    delete reviews[appName];
                }
                localStorage.setItem('kurdroid_reviews', JSON.stringify(reviews));
            }
        }
        reviewToDelete = null;
    }

    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const newAvatarSrc = event.target.result;
                userProfile.avatar = newAvatarSrc;
                localStorage.setItem('kurdroid_userProfile', JSON.stringify(userProfile));
                renderProfileInfo();
            }
            reader.readAsDataURL(file);
        }
    }

    function handleCoverUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const newCoverSrc = event.target.result;
                userProfile.cover = newCoverSrc;
                localStorage.setItem('kurdroid_userProfile', JSON.stringify(userProfile));
                renderProfileInfo();
            }
            reader.readAsDataURL(file);
        }
    }

    // --- INITIALIZATION ---

    avatarContainer.addEventListener('click', () => {
        avatarUploadInput.click();
    });

    avatarUploadInput.addEventListener('change', handleAvatarUpload);

    editCoverBtn.addEventListener('click', () => {
        coverPhotoUploadInput.click();
    });

    coverPhotoUploadInput.addEventListener('change', handleCoverUpload);

    myReviewsListEl.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.btn-delete-review');
        if (deleteButton) {
            showDeleteReviewConfirmation(deleteButton.dataset.reviewId);
        }
    });

    applyTheme();
    renderProfileInfo();
    renderMyReviews();
    renderMyFavorites();
});