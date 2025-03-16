const searchInput = document.getElementById('searchInput');
const contactList = document.getElementById('contactList');
const contactDetails = document.getElementById('contactDetails');
const detailsHeader = document.getElementById('contactName');
const detailsLabel = document.getElementById('contactLabel');
const detailsInfo = document.querySelector('.details-info');
const addContactBtn = document.getElementById('addContactBtn');
const editContactBtn = document.getElementById('editContactBtn');
const deleteContactBtn = document.getElementById('deleteContactBtn');
const contactModal = document.getElementById('contactModal');
const contactForm = document.getElementById('contactForm');
const closeButton = document.querySelector('.close-button');
const fullNameInput = document.getElementById('fullName');
const labelInput = document.getElementById('label');
const phoneNumberInput = document.getElementById('phoneNumber');
const emailInput = document.getElementById('email');
const modalNotesInput = document.getElementById('modalNotes');
const contactNotesTextArea = document.getElementById('contactNotes');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const emptyState = document.getElementById('emptyState');
const quickAddBtn = document.getElementById('quickAddBtn');
const filterLabelSelect = document.getElementById('filterLabel');

let contacts = [];
let selectedContactId = null;

// Empty State Design
function toggleEmptyState() {
    if (contacts.length === 0) {
        emptyState.style.display = 'block';
        contactList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        contactList.style.display = 'block';
    }
}

// Load contacts from localStorage or initialize with default contacts
function loadContacts() {
    const storedContacts = localStorage.getItem('contacts');
    contacts = storedContacts ? JSON.parse(storedContacts) : [];
    sortContacts();
    renderContacts();
    toggleEmptyState();
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    darkModeToggle.checked = isDarkMode;
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
}

// Utility function to debounce search input
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Save contacts to localStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Sort contacts alphabetically by full name
function sortContacts() {
    contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

// Render contacts in the contact list with alphabetical separators
function renderContacts() {
    contactList.innerHTML = '';
    let lastInitial = '';

    // Get selected label
    const selectedLabel = filterLabelSelect.value;
    let filteredContacts = contacts;

    if (selectedLabel !== "all") {
        filteredContacts = contacts.filter(contact => contact.label === selectedLabel);
    }

    filteredContacts.forEach(contact => {
        const initial = contact.fullName.charAt(0).toUpperCase();
        if (initial !== lastInitial) {
            const separator = document.createElement('li');
            separator.classList.add('alphabetical-separator');
            separator.textContent = initial;
            contactList.appendChild(separator);
            lastInitial = initial;
        }

        const listItem = document.createElement('li');
        listItem.classList.add('contact-item');
        listItem.dataset.id = contact.id;
        listItem.innerHTML = `
            <span class="name">${contact.fullName}</span>
            <span class="label">${contact.label}</span>
            <span class="star"><i class="fas fa-star"></i></span>
        `;
        if (contact.favorite) {
            listItem.classList.add('favorite');
        }
        listItem.addEventListener('click', () => showContactDetails(contact.id));
        const starIcon = listItem.querySelector('.star');
        starIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the contact details
            toggleFavorite(contact.id);
        });

        contactList.appendChild(listItem);
    });
    toggleEmptyState();
}

// Add/remove contact from favorites
function toggleFavorite(id) {
    contacts = contacts.map(contact =>
        contact.id === id ? { ...contact, favorite: !contact.favorite } : contact
    );
    saveContacts();
    sortContacts(); // Keep sorted
    renderContacts();
}

// Show contact details in the contact details section
function showContactDetails(id) {
    selectedContactId = id;
    const contact = contacts.find(c => c.id === id);
    detailsHeader.textContent = contact.fullName;
    detailsLabel.textContent = contact.label || 'N/A';
    contactNotesTextArea.value = contact.notes || '';

    detailsInfo.innerHTML = `
        <li><i class='fas fa-user'></i> Full Name: ${contact.fullName}</li>
        <li><i class='fas fa-tag'></i> Label: ${contact.label || 'N/A'}</li>
        <li><i class='fas fa-phone'></i> Phone Number: ${contact.phoneNumber || 'N/A'}</li>
        <li><i class='fas fa-envelope'></i> Email: ${contact.email || 'N/A'}</li>
        <!-- Add more custom fields here -->
    `;

    // Save notes when focus is lost
    contactNotesTextArea.removeEventListener('blur', saveNotesHandler); // Remove existing listener
    saveNotesHandler = () => saveContactNotes(id, contactNotesTextArea.value); // Create a new handler
    contactNotesTextArea.addEventListener('blur', saveNotesHandler); // Add the new handler

    // Apply slide-in animation
    contactDetails.style.animation = 'none'; // Reset animation
    void contactDetails.offsetWidth; // Trigger reflow
    contactDetails.style.animation = null;
    contactDetails.style.animation = 'slideIn 0.5s ease-out';
}

// Create a saveNotesHandler variable
let saveNotesHandler;

// Save contact notes
function saveContactNotes(id, notes) {
    contacts = contacts.map(contact =>
        contact.id === id ? { ...contact, notes: notes } : contact
    );
    saveContacts();
}

// Open the contact modal for adding a new contact
function openAddContactModal() {
    contactModal.style.display = 'block';
    document.getElementById('contactId').value = '';
    fullNameInput.value = '';
    labelInput.value = 'Friend'; // Default value for the dropdown
    phoneNumberInput.value = '';
    emailInput.value = '';
    modalNotesInput.value = '';
    selectedContactId = null;
}

// Open the contact modal for editing an existing contact
function openEditContactModal() {
    if (!selectedContactId) {
        alert('Please select a contact to edit.');
        return;
    }
    contactModal.style.display = 'block';
    const contact = contacts.find(c => c.id === selectedContactId);
    document.getElementById('contactId').value = contact.id;
    fullNameInput.value = contact.fullName;
    labelInput.value = contact.label || 'Friend'; // Default value if label is missing
    phoneNumberInput.value = contact.phoneNumber || '';
    emailInput.value = contact.email || '';
    modalNotesInput.value = contact.notes || '';
}

// Function to close the contact modal
function closeContactModal() {
    contactModal.style.display = 'none';
}

// Handle the contact form submission
function handleContactFormSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('contactId').value;
    const fullName = fullNameInput.value;
    const label = labelInput.value;
    const phoneNumber = phoneNumberInput.value;
    const email = emailInput.value;
    const notes = modalNotesInput.value;

    if (id) {
        // Edit existing contact
        contacts = contacts.map(contact =>
            contact.id === parseInt(id) ? { ...contact, fullName, label, phoneNumber, email, notes } : contact
        );
    } else {
        // Add new contact
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        const newContact = { id: newId, fullName, label, phoneNumber, email, notes, favorite: false };
        contacts.push(newContact);

        // Auto-select the new contact
        selectedContactId = newId;
    }

    sortContacts(); // Sort after adding or editing
    saveContacts();
    renderContacts();
    closeContactModal();

    //Auto select the new contact
    if (!id) {
        showContactDetails(selectedContactId);
    }

    toggleEmptyState();
}

// Delete the selected contact
function deleteContact() {
    if (!selectedContactId) {
        alert('Please select a contact to delete.');
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this contact?');
    if (confirmDelete) {
        contacts = contacts.filter(contact => contact.id !== selectedContactId);
        saveContacts();
        renderContacts();

        // Clear the contact details section
        detailsHeader.textContent = 'Select a Contact';
        detailsLabel.textContent = 'Details will appear here';
        detailsInfo.innerHTML = '';
        selectedContactId = null;
        toggleEmptyState();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

// Search Functionality with Debouncing
const performSearch = () => {
    const filter = searchInput.value.toLowerCase();
    const contactItems = document.querySelectorAll('.contact-item');

    contactItems.forEach(item => {
        const name = item.querySelector('.name').textContent.toLowerCase();
        if (name.includes(filter)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
};

// Add event listeners
searchInput.addEventListener('input', debounce(performSearch, 300));

addContactBtn.addEventListener('click', openAddContactModal);
quickAddBtn.addEventListener('click', openAddContactModal);
editContactBtn.addEventListener('click', openEditContactModal);
deleteContactBtn.addEventListener('click', deleteContact);
closeButton.addEventListener('click', closeContactModal);
contactForm.addEventListener('submit', handleContactFormSubmit);
darkModeToggle.addEventListener('change', toggleDarkMode);

// Event listener for filterLabel select
filterLabelSelect.addEventListener('change', renderContacts);

// Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault(); // Prevent the default browser action
        openAddContactModal();
    }
    if (event.key === 'Escape') {
        closeContactModal();
    }
});

//Initial load
loadContacts();

