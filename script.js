const newCard = document.getElementById("add-new-card");
const searchInput = document.getElementById("search-note");

let myModal,
    filters = document.querySelectorAll('input[type="radio"][name="filter"]'),
    currentCategory = document.querySelectorAll('input[type="checkbox"][name="category"]'),
    selectedFilter = 'all',
    selectedCategories = [];

function addModal() {
    // Создаем элементы модального окна
    let modal = document.createElement("div");
    modal.classList.add("modal");
    modal.id = "myModal";
    modal.style.display = "block";
    myModal = modal;
  
    let modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
  
    let closeSpan = document.createElement("span");
    closeSpan.classList.add("close");
    closeSpan.id = "closeModal";
    closeSpan.innerHTML = "&times;";
    closeSpan.addEventListener('click', function() {
        removeModal(modal);
        myModal = undefined; 
    });
  
    let h2 = document.createElement("h2");
    h2.textContent = "Add New Note";
  
    let inputTitle = document.createElement("input");
    inputTitle.type = "text";
    inputTitle.id = "noteTitle";
    inputTitle.placeholder = "Enter title...";
  
    let selectCategory = document.createElement("select");
    selectCategory.id = "noteCategory";
  
    let optionShopping = document.createElement("option");
    optionShopping.value = "shopping";
    optionShopping.textContent = "Shopping";
    selectCategory.appendChild(optionShopping);
  
    let optionBusiness = document.createElement("option");
    optionBusiness.value = "business";
    optionBusiness.textContent = "Business";
    selectCategory.appendChild(optionBusiness);
  
    let optionOther = document.createElement("option");
    optionOther.value = "other";
    optionOther.textContent = "Other things";
    selectCategory.appendChild(optionOther);
  
    let textarea = document.createElement("textarea");
    textarea.id = "noteText";
    textarea.placeholder = "Enter your note...";
  
    let submitButton = document.createElement("button");
    submitButton.id = "submitNote";
    submitButton.textContent = "Submit";
    submitButton.addEventListener('click', () => createTask());
  
    modalContent.appendChild(closeSpan);
    modalContent.appendChild(h2);
    modalContent.appendChild(inputTitle);
    modalContent.appendChild(selectCategory);
    modalContent.appendChild(textarea);
    modalContent.appendChild(submitButton);
  
    modal.appendChild(modalContent);
  
    document.body.appendChild(modal);
}

function removeModal(removeObject) {
    document.body.removeChild(removeObject);
}

function createTask() {
    const title = document.getElementById("noteTitle").value;
    const category = document.getElementById("noteCategory").value;
    const text = document.getElementById("noteText").value;

    const note = {
        title: title,
        category: category,
        text: text,
        classes: []
    };

    const card = document.createElement("li");
    card.classList.add("card");

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const cardTitle = document.createElement("h2");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = title;

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="#FFF" stroke-width="1.5" d="M5 7H21M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3M3 7l1 14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2l1-14M9 11h6"/></svg>';
    deleteButton.addEventListener('click', function() {
        card.classList.toggle("trash");
        removeCard(card, selectedFilter, title);
    });

    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("favorite-button");
    favoriteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="#FFF" stroke-width="1.5" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    favoriteButton.addEventListener('click', function() {
        card.classList.toggle("favorites");
        removeCard(card, selectedFilter);
        if (card.classList.contains("favorites")) {
            const path = favoriteButton.querySelector('svg path');
            if (path) {
                path.style.fill = '#FFF';
            }
        } else {
            const path = favoriteButton.querySelector('svg path');
            if (path) {
                path.style.fill = 'none';
            }
        }
    });

    actions.appendChild(deleteButton);
    actions.appendChild(favoriteButton);

    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(actions);

    card.appendChild(cardHeader);

    if (category === "shopping") {
        card.classList.add('cardShopping');
    } else if (category === "business") {
        card.classList.add('cardBusiness');
    } else if (category === "other") {
        card.classList.add('cardOther');
    }

    const cardDescription = document.createElement("p");
    cardDescription.classList.add("card-description");
    cardDescription.textContent = text;

    card.appendChild(cardDescription);
    note.classes = Array.from(card.classList).toString();
    console.log(note.classes)

    document.querySelector(".cards-list").appendChild(card);
    saveNoteToLocalStorage(note);

    removeModal(myModal);
}

window.addEventListener('click', (event) => {
    if (event.target == myModal) {
        removeModal(myModal);
        myModal = undefined; 
    }
})

document.body.addEventListener("keydown", function(event) {
    if (myModal && typeof myModal === "object" && event.key === "Escape") {
        removeModal(myModal);
        myModal = undefined; 
    }
});

filters.forEach(filter => {
    filter.addEventListener('change', function(event) {
        selectedFilter = event.target.value;
        openFilter(selectedFilter);
    })
})

currentCategory.forEach(category => {
    category.addEventListener('change', function() {
        selectedCategories = [];
        document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        openCategories(selectedCategories);
    });
});

function openFilter(filter) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (filter === 'all') {
            if (!card.classList.contains('trash')) {
                card.style.display = 'list-item';
            } else card.style.display = 'none';
        } else if (filter === 'trash') {
            if (card.classList.contains('trash')) {
                card.style.display = 'list-item';
            } else {
                card.style.display = 'none';
            }   
        } else if (filter === 'favorites') {
            if (card.classList.contains('favorites')) {
                if (!card.classList.contains('trash')) {
                    card.style.display = 'list-item';
                } else card.style.display = 'none';
            } else {
                card.style.display = 'none';
            }
        }
    })
}

function openCategories(categories) {
    const cards = document.querySelectorAll('.card');
    const categoriesList = {
        shopping: 'cardShopping',
        business: 'cardBusiness',
        other: 'cardOther'
    };
    
    cards.forEach(card => {
        let shouldDisplay = false;
        categories.forEach(category => {
            const categoryClass = categoriesList[category];
            if (card.classList.contains(categoryClass)) {
                shouldDisplay = true;
            }
        });
        card.style.display = shouldDisplay ? 'list-item' : 'none';
    });
}

function removeCard(card, currentFilter, title) {
    if (currentFilter === 'favorites') {
        if (!card.classList.contains('favorites')) {
            card.style.display = 'none';    
        }
    }
    if (currentFilter === 'all' || currentFilter === 'favorites') {
        if (card.classList.contains('trash')) {
            card.style.display = 'none';
        }
    }
    if (currentFilter === 'trash') {
        if (!card.classList.contains('trash')) {
            removeNoteFromLocalStorage(title); 
            card.remove();
        }
    }
}

searchInput.addEventListener('input', function(event) {
    const searchText = event.target.value.toLowerCase();

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        let shouldDisplay = false;

        if (card.querySelector('.card-title').textContent.toLowerCase().includes(searchText) || 
            card.querySelector('.card-description').textContent.toLowerCase().includes(searchText)) {
            shouldDisplay = true;

            for (const category of selectedCategories) {
                const categoryClass = 'card' + category.charAt(0).toUpperCase() + category.slice(1);
                if (card.classList.contains(categoryClass)) {
                    shouldDisplay = true;
                    break;
                } else {
                    shouldDisplay = false;
                }
            }
        } else {
            shouldDisplay = false;
        }

        if (selectedFilter === 'all') {
            if (card.classList.contains('trash')) {
                shouldDisplay = false;
            }
        } else if (selectedFilter === 'trash') {
            if (!card.classList.contains('trash')) {
                shouldDisplay = false;
            }
        } else if (selectedFilter === 'favorites') {
            if (!card.classList.contains('favorites')) {
                shouldDisplay = false;
            }
        }

        card.style.display = shouldDisplay ? 'list-item' : 'none';
    });
});

function getNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('notes'));
    return notes ? notes : [];
}

function saveNoteToLocalStorage(note) {
    let notes = getNotesFromLocalStorage();
    console.log(`Before LS:`)
    console.log(notes)
    notes.push(note);
    console.log(`After LS:`)
    console.log(notes)
    localStorage.setItem('notes', JSON.stringify(notes));
}

function removeNoteFromLocalStorage(title) {
    let notes = getNotesFromLocalStorage();
    notes = notes.filter(note => note.title !== title);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotesFromLocalStorage() {
    const notes = getNotesFromLocalStorage();
    console.log(notes.length)

    if (notes.length > 0) {
        console.log("abracaadbra_")
        notes.forEach(note => {
            const card = document.createElement("li");
            card.classList.add("card");

            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header");

            const cardTitle = document.createElement("h2");
            cardTitle.classList.add("card-title");
            cardTitle.textContent = note.title;

            const actions = document.createElement("div");
            actions.classList.add("actions");

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="#FFF" stroke-width="1.5" d="M5 7H21M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3M3 7l1 14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2l1-14M9 11h6"/></svg>';
            deleteButton.addEventListener('click', function() {
                card.classList.toggle("trash");
                removeCard(card, selectedFilter, note.title);
            });
        
            const favoriteButton = document.createElement("button");
            favoriteButton.classList.add("favorite-button");
            favoriteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="#FFF" stroke-width="1.5" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
            favoriteButton.addEventListener('click', function() {
                card.classList.toggle("favorites");
                removeCard(card, selectedFilter);
                if (card.classList.contains("favorites")) {
                    const path = favoriteButton.querySelector('svg path');
                    if (path) {
                        path.style.fill = '#FFF';
                    }
                } else {
                    const path = favoriteButton.querySelector('svg path');
                    if (path) {
                        path.style.fill = 'none';
                    }
                }
            });
        
            actions.appendChild(deleteButton);
            actions.appendChild(favoriteButton);
            
            cardHeader.appendChild(cardTitle);
            cardHeader.appendChild(actions);
        
            card.appendChild(cardHeader);
        
            if (note.category === "shopping") {
                card.classList.add('cardShopping');
            } else if (note.category === "business") {
                card.classList.add('cardBusiness');
            } else if (note.category === "other") {
                card.classList.add('cardOther');
            }
        
            const cardDescription = document.createElement("p");
            cardDescription.classList.add("card-description");
            cardDescription.textContent = note.text;
        
            card.appendChild(cardDescription);
        
            document.querySelector(".cards-list").appendChild(card);
        });
    }
}




document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
    });
    loadNotesFromLocalStorage();
})