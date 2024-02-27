const newCard = document.getElementById("add-new-card");
const searchInput = document.getElementById("search-note");

const categoryStyles = {
    shopping: 'cardShopping',
    business: 'cardBusiness',
    other: 'cardOther'
};

let modal,
    filters = document.querySelectorAll('.filter-input'),
    currentCategory = document.querySelectorAll('.category-input'),
    modalCategories,
    selectedFilter = 'all',
    selectedCategories = [];

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function addModal() {
    document.body.innerHTML += `
        <div class="modal" id="modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-container">
                    <h2 class="modal-title">Add New Note</h2>
                    <span class="close" id="closeModal">&times;</span>
                </div>
                <input type="text" class="note-title" id="noteTitle" placeholder="Enter title...">
                <div class="categories">
                    <input type="checkbox" name="category" class="category-check" id="shoppingCheck" value="shopping">
                    <label for="shoppingCheck" class="category-label">shopping</label>
                    <input type="checkbox" name="category" class="category-check" id="businessCheck" value="business">
                    <label for="businessCheck" class="category-label">business</label>
                    <input type="checkbox" name="category" class="category-check" id="otherCheck" value="other">
                    <label for="otherCheck" class="category-label">other things</label>
                </div>
                <textarea class="note-text" id="noteText" placeholder="Enter your note..."></textarea>
                <button class="submit-button" id="submitNote">Submit</button>
            </div>
        </div>
    `;
    modal = document.getElementById('modal');

    modalCategories = document.querySelectorAll('.modal .category-check');
    inputChanger(modalCategories, false);

    document.getElementById('closeModal').addEventListener('click', function() {
        removeModal();
    });

    document.getElementById('submitNote').addEventListener('click', () => submitEvent());

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            removeModal();
        }
    })
}

function removeModal() {
    document.body.removeChild(modal);
    modal = null;
}

function inputChanger(inputList, flag) {
    inputList.forEach(category => {
        category.addEventListener('change', function() {
            selectedCategories = [];
            document.querySelectorAll(`.${category.className}:checked`).forEach(checkbox => {
                selectedCategories.push(checkbox.value);
                console.log(`selected: ${selectedCategories}`)
            });
            if (flag) {
                openCategories(selectedCategories, selectedFilter);
            }
        })
    })
}

function submitEvent() {
    const title = document.getElementById("noteTitle").value;
    const text = document.getElementById("noteText").value;

    const checkedCheckboxes = document.querySelectorAll('.modal .category-check:checked');
    const selectedValues = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

    const newTask = createTask(title, selectedValues, text, false, false);
    saveNoteToLocalStorage(newTask);
    console.log(newTask)
    removeModal();
}

function createTask(title, categories, text, isTrash = false, isFavorite = false) {
    const note = {
        title: title,
        category: categories,
        text: text,
        classes: [],
        trash: isTrash,
        favorite: isFavorite
    };

    let newNote = Object.assign({}, note);

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
    deleteButton.innerHTML = `
        <svg class="right-svg" viewBox="0 0 24 24" width="18" height="18">
            <use xlink:href="sprites.svg#trash"></use>
        </svg>`;
    deleteButton.addEventListener('click', function() {
        card.classList.toggle("trash");
        if (selectedFilter === 'trash') {
            removeCard(card, note.title);
        } else {
            newNote.trash = true;
            hideCard(card, selectedFilter);
            updateNoteInLocalStorage(note, newNote);
        }
    });

    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("favorite-button");
    favoriteButton.innerHTML = `
        <svg class="right-svg" viewBox="0 0 24 24" width="18" height="18">
            <use xlink:href="sprites.svg#favorites"></use>
        </svg>`;
    favoriteButton.addEventListener('click', function() {
        card.classList.toggle("favorites");
        const svgElement = favoriteButton.querySelector('.right-svg');
        svgElement.classList.toggle('svg-active');

        newNote.favorite = !newNote.favorite;
        console.log(newNote)
        hideCard(card, selectedFilter);
        updateNoteInLocalStorage(note, newNote);
        note.favorite = newNote.favorite;
    });

    actions.appendChild(deleteButton);
    actions.appendChild(favoriteButton);

    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(actions);

    card.appendChild(cardHeader);

    note.category.forEach(cat => {
        if (categoryStyles[cat]) {
            card.classList.add(categoryStyles[cat]);
        }
    });
    note.classes = Array.from(card.classList).toString();

    const cardDescription = document.createElement("p");
    cardDescription.classList.add("card-description");
    cardDescription.textContent = note.text;

    card.appendChild(cardDescription);

    document.querySelector(".cards-list").appendChild(card);
    return note;
}

// ОСТАНОВКА ----------

function openFilter(filter, categories) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const isCardContainsFavorites = card.classList.contains('favorites');
        const isCardContainsTrash = card.classList.contains('trash');
        console.log(`Categories:`)
        console.log(categories)
        const isOpenCategory = categories.some(category => card.classList.contains('card' + capitalize(category)));

        switch (filter) {
            case 'all':
                card.style.display = (!isCardContainsTrash && isOpenCategory) ? 'list-item' : 'none';
                break;
            case 'trash':
                card.style.display = (isCardContainsTrash && isOpenCategory) ? 'list-item' : 'none';
                break;
            case 'favorites':
                card.style.display = (isCardContainsFavorites && !isCardContainsTrash && isOpenCategory) ? 'list-item' : 'none';
                break;
            default:
                break;
        }
    })
}

function openCategories(categories, currentFilter) {
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
            const containsCategory = card.classList.contains(categoryClass);

            const isCardContainsFavorites = card.classList.contains('favorites');
            const isCardContainsTrash = card.classList.contains('trash');

            switch (currentFilter) {
                case 'all':
                    if (!isCardContainsTrash && containsCategory) {
                        shouldDisplay = true;
                    }
                    break;
                case 'trash':
                    if (isCardContainsTrash && containsCategory) {
                        shouldDisplay = true;
                    }
                    break;
                case 'favorites':
                    if (isCardContainsFavorites && !isCardContainsTrash && containsCategory) {
                        shouldDisplay = true;
                    }
                    break;
                default:
                    break;
            }
        });
        card.style.display = shouldDisplay ? 'list-item' : 'none';
    });
}

function removeCard(card, title) {
    if (!card.classList.contains('trash')) {
        removeNoteFromLocalStorage(title);
        card.remove();
    }
}

function hideCard(card, currentFilter) {
    const isFavoriteFilter = currentFilter === 'favorites';
    const isNotTrashFilter = currentFilter === 'all' || isFavoriteFilter;
    const isAllOrFavoritesAndTrash = isNotTrashFilter && card.classList.contains('trash');

    if ((isFavoriteFilter && !card.classList.contains('favorites')) || isAllOrFavoritesAndTrash) {
        card.style.display = 'none';
    }
}

function getNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('notes'));
    return notes ? notes : [];
}

function saveNoteToLocalStorage(note) {
    let notes = getNotesFromLocalStorage();
    const updatedNote = {
        ...note,
        index: notes.length
    };
    // console.log(`Before LS:`)
    // console.log(notes)
    notes.push(updatedNote);
    // console.log(`After LS:`)
    // console.log(notes)
    localStorage.setItem('notes', JSON.stringify(notes));
}

function removeNoteFromLocalStorage(title) {
    let notes = getNotesFromLocalStorage();
    notes = notes.filter(note => note.title !== title);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function updateNoteInLocalStorage(note, newNote) {
    // Получаем все записи из localStorage
    let notes = getNotesFromLocalStorage();

    // Ищем запись, которую нужно обновить
    const index = notes.findIndex(existingNote => existingNote.title === note.title &&
        existingNote.category.toString() === note.category.toString() &&
        existingNote.text === note.text &&
        existingNote.trash === note.trash &&
        existingNote.favorite === note.favorite);

    // Если запись найдена, обновляем ее
    if (index !== -1) {
        // Обновляем свойство trash в найденной записи
        notes[index].trash = newNote.trash;
        notes[index].favorite = newNote.favorite;
        // Обновляем запись в localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
    }
}


function loadNotesFromLocalStorage() {
    const notes = getNotesFromLocalStorage();
    console.log(notes.length)

    if (notes.length > 0) {
        console.log("abracaadbra_")
        notes.forEach(note => {
            createTask(note.title, note.category, note.text)
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
    });
    loadNotesFromLocalStorage();
    document.body.addEventListener("keydown", function(event) {
        if (modal && event.key === "Escape") {
            removeModal();
        }
    });
    filters.forEach(filter => {
        filter.addEventListener('change', function(event) {
            selectedFilter = event.target.value;
            openFilter(selectedFilter, selectedCategories);
        })
    })

    inputChanger(currentCategory, true);

    searchInput.addEventListener('input', function(event) {
        const searchText = event.target.value.toLowerCase();
        const cards = document.querySelectorAll('.card');
        function capitalize(word) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-description').textContent.toLowerCase();
            const isTrash = card.classList.contains('trash');
            const isFavorites = card.classList.contains('favorites');

            const isTextMatch = title.includes(searchText) || description.includes(searchText);

            const isCategoryMatch = selectedCategories.some(category =>
                card.classList.contains('card' + capitalize(category))
            );

            const isFilterMatch = (selectedFilter === 'all' && !isTrash) ||
                (selectedFilter === 'trash' && isTrash) ||
                (selectedFilter === 'favorites' && isFavorites);

            const shouldDisplay = isTextMatch && isCategoryMatch && isFilterMatch;

            card.style.display = shouldDisplay ? 'list-item' : 'none';
        });
    });
})