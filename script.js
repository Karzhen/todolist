const filters = document.querySelectorAll('.filter-input'),
    newCard = document.getElementById("add-new-card"),
    categoryInputs = document.querySelectorAll('.category-input'),
    searchInput = document.getElementById("search-note");

const categoryStyles = {
    shopping: 'cardShopping',
    business: 'cardBusiness',
    other: 'cardOther'
};

let currentCategory = 1,
    modalCategories,
    selectedFilter = 'all',
    selectedCategories = [];

/**
 * Функция для преобразования первой буквы слова в верхний регистр, а остальных в нижний регистр.
 * @param {string} word - Входное слово.
 * @returns {string} - Преобразованное слово.
 */
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Функция для переключения стиля активации/деактивации кнопки "Избранное".
 * @param {HTMLElement} nodeElement - HTML-элемент карточки.
 * @param {boolean} flag - Флаг, указывающий на необходимость активации или деактивации.
 */
function toggleFavorite(nodeElement, flag) {
    const svgElement = nodeElement.querySelector('.favorite-button .right-svg');
    flag ? svgElement.classList.add('svg-active') : svgElement.classList.remove('svg-active');
}

function toggleTrash(nodeElement, flag) {
    const svgElement = nodeElement.querySelector('.favorite-button .right-svg');
    flag ? svgElement.classList.add('svg-active') : svgElement.classList.remove('svg-active');
}

/**
 * Функция для добавления модального окна
 * и последующего создания новой заметки.
 */
function addModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-container">
                <h2 class="modal-title">Add New Note</h2>
                <span class="close" id="closeModal">&times;</span>
            </div>
            <input type="text" class="note-title" id="noteTitle" placeholder="Enter title...">
            <div class="categories">
                <input type="checkbox" name="category" class="category-check" id="shoppingCheck" value="shopping" checked>
                <label for="shoppingCheck" class="category-label">shopping</label>
                <input type="checkbox" name="category" class="category-check" id="businessCheck" value="business">
                <label for="businessCheck" class="category-label">business</label>
                <input type="checkbox" name="category" class="category-check" id="otherCheck" value="other">
                <label for="otherCheck" class="category-label">other things</label>
            </div>
            <textarea class="note-text" id="noteText" placeholder="Enter your note..."></textarea>
            <button class="submit-button" id="submitNote">Submit</button>
        </div>
    `;
    document.body.appendChild(modal);

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

/**
 * Функция для обработки события отправки формы новой заметки.
 */
function submitEvent() {
    const title = document.getElementById("noteTitle").value;
    const text = document.getElementById("noteText").value;

    const checkedCheckboxes = document.querySelectorAll('.modal .category-check:checked');
    const selectedValues = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

    const newTask = createTask(title, selectedValues, text, false, false);
    saveNoteToLocalStorage(newTask);
    removeModal();
}

/**
 * Функция для удаления модального окна.
 */
function removeModal() {
    const modal = document.getElementById('modal');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

/**
 * Функция для обработки изменений в чекбоксах категорий.
 * @param {NodeList} inputList - Список входных элементов (чекбоксов категорий).
 * @param {boolean} flag - Флаг, указывающий на необходимость выполнения дополнительных действий при изменении.
 */
function inputChanger(inputList, flag) {
    inputList.forEach(category => {
        category.addEventListener('change', function() {
            // Для каждого изменения каждой категории
            const categories = [];
            document.querySelectorAll(`.${category.className}:checked`).forEach(checkbox => {
                categories.push(checkbox.value);
            });
            if (flag) {
                selectedCategories = categories;
                openCategories(selectedCategories, selectedFilter);
            }
        })
    })
}

/**
 * Функция для отображения карточек в соответствии с выбранными категориями и текущим фильтром.
 * @param {string[]} categories - Выбранные категории.
 * @param {string} currentFilter - Текущий фильтр (all, trash, favorites).
 */
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

/**
 * Функция для изменения фильтрации.
 * При нажатии на фильтры вызывается openFilter
 */
function filterChanger() {
    filters.forEach(filter => {
        filter.addEventListener('change', function(event) {
            selectedFilter = event.target.value;
            openFilter(selectedFilter, selectedCategories);
        })
    })
}

// ОСТАНОВКА ----------
/**
 * Открывает фильтр для отображения карт, учитывая выбранные категории
 * @param {string} filter - Фильтр для применения ('all', 'trash', 'favorites')
 * @param {Array} categories - Массив категорий для фильтрации
 */
function openFilter(filter, categories) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const isCardContainsFavorites = card.classList.contains('favorites');
        const isCardContainsTrash = card.classList.contains('trash');
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

/**
 * Создает новую задачу с заданными параметрами и добавляет её на страницу
 * @param {string} title - Заголовок задачи
 * @param {Array} categories - Массив категорий для задачи
 * @param {string} text - Текст задачи
 * Два флага нужны для вызова данной функции при загрузке контента из LocalStorage
 * @param {boolean} isTrash - Флаг, указывающий на то, помечена ли задача как удаленная (по умолчанию false)
 * @param {boolean} isFavorite - Флаг, указывающий на то, помечена ли задача как избранная (по умолчанию false)
 * @returns {Object} - Объект с информацией о созданной задаче
 */
function createTask(title, categories, text, isTrash = false, isFavorite = false) {
    const note = {
        title: title,
        category: categories,
        text: text,
        classes: '',
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
        card.classList.contains('favorites') ? toggleFavorite(card, true) : toggleFavorite(card, false);
        newNote.favorite = !newNote.favorite;
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
        };
    });
    note.classes = Array.from(card.classList).toString();

    if (isTrash === true) {
        card.classList.add('trash');
        hideCard(card, selectedFilter);
    }
    if (isFavorite === true) {
        card.classList.add('favorites');
        toggleFavorite(card, true);
    }

    const cardDescription = document.createElement("ul");
    cardDescription.classList.add("card-description");

    const inputDescription = note.text.split('\n');
    if (inputDescription.length > 1) {
        inputDescription.forEach(line => {
            const listItem = document.createElement("li");
            listItem.classList.add("description-text");
            listItem.textContent = line.toString();
            cardDescription.appendChild(listItem);
        });
    } else {
        const cardDescriptionItem = document.createElement("li");
        cardDescriptionItem.classList.add("description-text");
        cardDescriptionItem.textContent = note.text;
        cardDescription.appendChild(cardDescriptionItem);
    }

    card.appendChild(cardDescription);

    document.querySelector(".cards-list").appendChild(card);
    openCategories(selectedCategories, selectedFilter);
    return note;
}

/**
 * Удаляет карту из DOM и из локального хранилища, если она не помечена как 'trash'
 * @param {HTMLElement} card - Карта для удаления
 * @param {string} title - Заголовок карты для удаления из локального хранилища
 */
// Нужно будет дополнить функционал, чтобы удалялась не по заголовку, потому что может быть два дубликата
function removeCard(card, title) {
    if (!card.classList.contains('trash')) {
        removeNoteFromLocalStorage(title);
        card.remove();
    }
}

/**
 * Скрывает карту в зависимости от текущего фильтра
 * @param {HTMLElement} card - Карта для скрытия
 * @param {string} currentFilter - Текущий фильтр ('all', 'trash', 'favorites')
 */
function hideCard(card, currentFilter) {
    const isFavoriteFilter = currentFilter === 'favorites';
    const isNotTrashFilter = currentFilter === 'all' || isFavoriteFilter;
    const isAllOrFavoritesAndTrash = isNotTrashFilter && card.classList.contains('trash');

    if ((isFavoriteFilter && !card.classList.contains('favorites')) || isAllOrFavoritesAndTrash) {
        card.style.display = 'none';
    }
}

/**
 * Получает заметки из локального хранилища, парсит их из JSON и возвращает массив заметок
 * @returns {Array} - Массив заметок из локального хранилища, либо пустой массив, если заметок нет
 */
function getNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('notes'));
    return notes ? notes : [];
}

/**
 * Сохраняет заметку в локальное хранилище
 * @param {Object} note - Заметка для сохранения
 */
function saveNoteToLocalStorage(note) {
    let notes = getNotesFromLocalStorage();
    const updatedNote = {
        ...note,
        index: notes.length
    };
    notes.push(updatedNote);
    localStorage.setItem('notes', JSON.stringify(notes));
}

/**
 * Удаляет заметку из локального хранилища по заголовку
 * @param {string} title - Заголовок заметки, которую нужно удалить
 */
// Исправить данную функцию, чтобы удаление происходило не по заголовку, а по карте, см. стр. 346
function removeNoteFromLocalStorage(title) {
    let notes = getNotesFromLocalStorage();
    notes = notes.filter(note => note.title !== title);
    localStorage.setItem('notes', JSON.stringify(notes));
}

/**
 * Обновляет информацию о заметке в локальном хранилище
 * @param {Object} note - Исходная информация о заметке, которую нужно обновить
 * @param {Object} newNote - Новая информация о заметке
 */
function updateNoteInLocalStorage(note, newNote) {
    let notes = getNotesFromLocalStorage();

    // Ищем запись, которую нужно обновить
    const existingNote = notes.find(existingNote =>
        existingNote.title === note.title &&
        existingNote.category.toString() === note.category.toString() &&
        existingNote.text === note.text &&
        existingNote.trash === note.trash &&
        existingNote.favorite === note.favorite);

    if (existingNote) {
        Object.assign(existingNote, newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
    }
}

/**
 * Загружает заметки из локального хранилища и создает карточки для каждой из них
 */
function loadNotesFromLocalStorage() {
    const notes = getNotesFromLocalStorage();
    console.log(`Количество загруженных заметок из localStorage: ${notes.length}`)

    if (notes.length > 0) {
        notes.forEach(note => {
            createTask(note.title, note.category, note.text, note.trash, note.favorite);
        });
    }
}

function checkCategoryInputs() {
    categoryInputs.forEach(category => {
        if (selectedCategories.includes(category.value)) {
            category.checked = true;
        }
    })
}

/**
 * Получает категории из списка классов.
 * @param {DOMTokenList} classList Список классов DOM-элемента.
 * @returns {string} Строка, содержащая категории, разделенные запятыми.
 */
function getCategoriesFromClasses(classList) {
    const categories = [];
    for (const category in categoryStyles) {
        if (categoryStyles.hasOwnProperty(category)) {
            if (classList.contains(categoryStyles[category])) {
                categories.push(category);
            }
        }
    }
    return categories.join(', ');
}

/**
 * Инициализирует выбранные категории.
 * Проходит по всем элементам в массиве категорий и добавляет значения тех, которые отмечены.
 */
function initializeSelectedCategories() {
    categoryInputs.forEach(category => {
        if (category.checked) {
            selectedCategories.push(category.value);
        }
    });
}

/**
 * Обрабатывает нажатие клавиши Escape.
 * Если нажата клавиша Escape, вызывает функцию removeModal().
 */
function handleEscapeKey() {
    document.body.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            removeModal();
        }
    });
}

/**
 * Обрабатывает ввод в поле поиска.
 * Фильтрует карточки в соответствии с введенным текстом, выбранными категориями и фильтром.
 * @param {Event} event Событие ввода, содержащее введенный текст.
 */
function handleSearchInput(event) {
    const searchText = event.target.value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const { title, description, isTrash, isFavorites } = getCardInfo(card);

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
}

/**
 * Получает информацию о карточке.
 * Извлекает заголовок, список категорий, описание, информацию о наличии в корзине и в избранном из карточки.
 * @param {HTMLElement} card Элемент карточки, содержащий информацию.
 * @returns {object} Объект, содержащий информацию о карточке: заголовок, список категорий,
 * описание, флаги принадлежности к категориям "Корзина" и "Избранное".
 */
function getCardInfo(card) {
    const titleText = card.querySelector('.card-title').textContent;
    const categoryList = getCategoriesFromClasses(card.classList);
    const descriptionItems = card.querySelectorAll('.card-description li');
    let descriptionText = '';
    descriptionItems.forEach((item, index) => {
        descriptionText += item.textContent;
        if (index < descriptionItems.length - 1) {
            descriptionText += '\n';
        }
    });
    const isTrash = card.classList.contains('trash');
    const isFavorites = card.classList.contains('favorites');

    return { titleText, categoryList, descriptionText, isTrash, isFavorites };
}

/**
 * Обрабатывает редактирование заголовка карточки.
 * Позволяет пользователю изменить заголовок карточки в режиме редактирования.
 * После завершения редактирования обновляет заголовок карточки и всю карточку в локальном хранилище.
 * @param {Event} event Событие, вызванное пользовательским действием.
 * @param {HTMLElement} card Элемент карточки, содержащий заголовок.
 * @param {string} titleText Текущий текст заголовка карточки.
 * @param {object} note Объект с информацией о карточке перед редактированием.
 * @param {object} newNote Объект с информацией о карточке после редактирования.
 */
function handleTitleEdit(event, card, titleText, note, newNote) {
    card.querySelector('.card-title').innerHTML = `<input type="text" class="edit-title" value="${titleText}">`;

    const editTitleInput = card.querySelector('.edit-title');
    editTitleInput.focus();
    editTitleInput.addEventListener('blur', function() {
        const newTitle = editTitleInput.value;
        card.querySelector('.card-title').textContent = newTitle;

        newNote.title = newTitle;
        updateNoteInLocalStorage(note, newNote);
    });
}

/**
 * Обрабатывает редактирование описания карточки.
 * Позволяет пользователю изменить текст описания карточки в режиме редактирования.
 * После завершения редактирования обновляет описание карточки и всю карточку в локальном хранилище.
 * @param {Event} event Событие, вызванное пользовательским действием.
 * @param {HTMLElement} card Элемент карточки, содержащий описание.
 * @param {string} descriptionText Текущий текст описания карточки.
 * @param {object} note Объект с информацией о карточке перед редактированием.
 * @param {object} newNote Объект с информацией о карточке после редактирования.
 */
function handleDescriptionEdit(event, card, descriptionText, note, newNote) {
    card.querySelector('.card-description').innerHTML = `<textarea class="edit-description">${descriptionText}</textarea>`;

    const editDescriptionTextarea = card.querySelector('.edit-description');
    editDescriptionTextarea.selectionStart = editDescriptionTextarea.value.length;

    editDescriptionTextarea.focus();
    editDescriptionTextarea.addEventListener('blur', function() {
        const newDescription = editDescriptionTextarea.value;

        const lines = newDescription.split('\n');

        const newDescriptionList = document.createElement('ul');
        newDescriptionList.classList.add('card-description');
        lines.forEach(line => {
            const listItem = document.createElement('li');
            listItem.classList.add('description-text');
            listItem.textContent = line.toString();
            newDescriptionList.appendChild(listItem);
        });

        const currentDescription = card.querySelector('.card-description');
        currentDescription.parentNode.replaceChild(newDescriptionList, currentDescription);

        newNote.text = newDescription;
        updateNoteInLocalStorage(note, newNote);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    initializeSelectedCategories();

    inputChanger(categoryInputs, true);
    filterChanger();
    loadNotesFromLocalStorage();
    handleEscapeKey();

    const cards = document.querySelectorAll('.card');

    searchInput.addEventListener('input', handleSearchInput);

    cards.forEach(card => {
        card.addEventListener('click', function(event) {
            const { titleText,
                categoryList,
                descriptionText,
                isTrash,
                isFavorites } = getCardInfo(card);

            const note = {
                title: titleText,
                category: [categoryList],
                text: descriptionText,
                trash: isTrash,
                favorite: isFavorites
            };

            let newNote = Object.assign({}, note);

            if (event.target.classList.contains('card-title')) {
                handleTitleEdit(event, card, titleText, note, newNote);
            }

            if (event.target.classList.contains('description-text')) {
                handleDescriptionEdit(event, card, descriptionText, note, newNote);
            }
        });
    });
})