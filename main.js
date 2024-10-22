// Select elements
const wishlistForm = document.getElementById('wishlistForm');
const wishlistCards = document.getElementById('wishlistCards');

let wishes = [];

// Load wishes from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedWishes = JSON.parse(localStorage.getItem('wishes')) || [];
    wishes = savedWishes;
    renderWishlist();
    checkForNotifications(); // Check for upcoming tasks every time the page loads
});

// Handle form submission
wishlistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    // Check if date is in the past
    const selectedDate = new Date(date);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
        alert("The selected date and time cannot be in the past. Please choose a valid date.");
        return; 
    }

    const wish = {
        id: Date.now(),
        title,
        description,
        expectedDate: date,
        addedDate: currentDate.toISOString()
    };

    wishes.push(wish);
    localStorage.setItem('wishes', JSON.stringify(wishes));

    renderWishlist();
    checkForNotifications(); // Check for any notifications after adding the new wish
    wishlistForm.reset(); 
});

// Render the wishlist
function renderWishlist() {
    wishlistCards.innerHTML = '';
    wishes.forEach(wish => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>${wish.title}</h3>
            <p>${wish.description}</p>
            <p><strong>Expected Date:</strong> ${new Date(wish.expectedDate).toLocaleString()}</p>
            <p><strong>Added Date:</strong> ${new Date(wish.addedDate).toLocaleString()}</p>
            <button onclick="editWish(${wish.id})">Edit</button>
            <button onclick="removeWish(${wish.id})">Remove</button>
        `;
        wishlistCards.appendChild(card);
    });
}

// Remove a wish
function removeWish(id) {
    wishes = wishes.filter(wish => wish.id !== id);
    localStorage.setItem('wishes', JSON.stringify(wishes));
    renderWishlist();
    checkForNotifications(); // Update notifications after removing a wish
}

// Edit a wish
function editWish(id) {
    const wishToEdit = wishes.find(wish => wish.id === id);
    document.getElementById('title').value = wishToEdit.title;
    document.getElementById('description').value = wishToEdit.description;
    document.getElementById('date').value = wishToEdit.expectedDate;

    removeWish(id);
}

// Check for tasks due in the next 30 minutes and notify the user
function checkForNotifications() {
    const now = new Date();
    wishes.forEach(wish => {
        const wishDate = new Date(wish.expectedDate);
        const timeDiff = wishDate - now;

        // Notify if the task is happening in the next 30 minutes (30 * 60 * 1000 ms)
        if (timeDiff > 0 && timeDiff <= 30 * 60 * 1000) {
            showNotification(wish.title, wish.description, wishDate);
        }
    });
}

// Show browser notification
function showNotification(title, description, wishDate) {
    if (Notification.permission === 'granted') {
        const notification = new Notification("Upcoming Wish!", {
            body: `Your wish "${title}" is due at ${wishDate.toLocaleString()}.`,
            icon: 'notification-icon.png' // Optional: Add an icon
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(title, description, wishDate);
            }
        });
    }
}

// Request notification permission on page load
if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
} else {
    alert('This browser does not support desktop notifications.');
}
