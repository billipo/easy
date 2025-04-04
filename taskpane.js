document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const openSavedListsButton = document.getElementById('open-saved-lists');
    const modal = document.getElementById('saved-lists-modal');
    const closeButton = modal.querySelector('.close');
    const listNameInput = document.getElementById('list-name-input');
    const saveListButton = document.getElementById('save-list-button');
    const savedListsDropdown = document.getElementById('saved-lists-dropdown');
    const loadListButton = document.getElementById('load-list-button');
    const deleteListButton = document.getElementById('delete-list-button');

    new Sortable(taskList, { animation: 150 });

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

	function addTask() {
		const taskName = taskInput.value.trim();
		if (taskName === '') return;
		renderTask(taskName);
		taskInput.value = '';
	}

	const emojiModal = document.getElementById('emoji-modal');
	const emojiInput = document.getElementById('emoji-input');
	const confirmEmojiButton = document.getElementById('confirm-emoji');
	let currentEmojiSpan;

	const emojiModalTitle = document.createElement('h3');
	emojiModal.querySelector('.modal-content').insertBefore(emojiModalTitle, emojiInput);

function renderTask(taskText, emoji = '👆') {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');
    
    const taskButton = document.createElement('button');
    taskButton.classList.add('task-button');
    taskButton.setAttribute('role', 'group');
    
    const emojiButton = document.createElement('button');
    emojiButton.textContent = emoji;
    emojiButton.classList.add('task-emoji');
    emojiButton.setAttribute('aria-label', `Change emoji for task: ${taskText}`);
    
    const textSpan = document.createElement('span');
    textSpan.textContent = taskText;
    textSpan.classList.add('task-text');
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '❌';
    deleteButton.classList.add('delete-task');
    deleteButton.setAttribute('aria-label', `Delete task: ${taskText}`);
    
    taskButton.appendChild(emojiButton);
    taskButton.appendChild(textSpan);
    taskButton.appendChild(deleteButton);
    
    taskButton.setAttribute('aria-label', `Task: ${taskText}, emoji: ${emoji}`);
    
    emojiButton.addEventListener('click', (e) => {
        currentEmojiSpan = e.target;
        emojiModal.style.display = 'block';
        emojiInput.value = '';
        emojiInput.focus();
		emojiModalTitle.textContent = '';
        emojiModalTitle.textContent = taskText;
    });
    
    deleteButton.addEventListener('click', () => {
        li.remove();
    });
    
    taskButton.addEventListener('click', (e) => {
        if (e.target !== emojiButton && e.target !== deleteButton) {
            taskButton.classList.toggle('completed');
            updateAriaLabel();
        }
    });
    
    function updateAriaLabel() {
        const status = taskButton.classList.contains('completed') ? 'Completed' : 'Incomplete';
        taskButton.setAttribute('aria-label', `${status}`);
    }
    
    li.appendChild(taskButton);
    taskList.prepend(li);
}

	emojiInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			const newEmoji = emojiInput.value.trim();
			if (newEmoji && currentEmojiSpan) {
				currentEmojiSpan.textContent = newEmoji;
			}
			emojiModal.style.display = 'none';
		}
	});

    window.addEventListener('click', (e) => {
        if (e.target === emojiModal) {
            emojiModal.style.display = 'none';
        }
    });

    // Close emoji modal with close button
    emojiModal.querySelector('.close').addEventListener('click', () => {
        emojiModal.style.display = 'none';
    });

    // Confirm new emoji
    confirmEmojiButton.addEventListener('click', () => {
        const newEmoji = emojiInput.value.trim();
        if (newEmoji && currentEmojiSpan) {
            currentEmojiSpan.textContent = newEmoji;
        }
        emojiModal.style.display = 'none';
    });
	
	/*emojiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const newEmoji = emojiInput.value.trim();
        if (newEmoji && currentEmojiSpan) {
            currentEmojiSpan.textContent = newEmoji;
        }
        emojiModal.style.display = 'none';
    }
	});*/

    openSavedListsButton.addEventListener('click', () => modal.style.display = 'block');
    closeButton.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

saveListButton.addEventListener('click', async () => {
    const now = Date.now();

    // Check if trial start date is saved
    const trialStart = localStorage.getItem('trialStart');
    const hasPaid = localStorage.getItem('hasPaid') === 'true';

    if (!trialStart && !hasPaid) {
        // First time: start trial
        localStorage.setItem('trialStart', now);
        alert('Your 1-day free trial has started! You can now save lists.');
    } else if (!hasPaid) {
        const oneDayMs = 24 * 60 * 60 * 1000;
        const trialExpired = now - parseInt(trialStart) > oneDayMs;

        if (trialExpired) {
            const wantsToBuy = confirm("Your free trial has ended. Upgrade to save more lists?");
            if (wantsToBuy) {
                window.open('https://appsource.microsoft.com/', '_blank'); // Replace with your add-in listing URL
            }
            return;
        }
    }

    // Save the list as usual
    const listName = listNameInput.value.trim();
    if (listName === '') return;

    const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
        name: li.querySelector('button').textContent,
        completed: li.querySelector('button').classList.contains('completed'),
        emoji: li.querySelector('.task-emoji').textContent,
    }));

    localStorage.setItem(listName, JSON.stringify(tasks));
    updateSavedListsDropdown();
    listNameInput.value = '';
});


loadListButton.addEventListener('click', () => {
    const listName = savedListsDropdown.value;
    if (!listName) return;

    const tasks = JSON.parse(localStorage.getItem(listName));
    taskList.innerHTML = '';
    tasks.forEach(task => {
        renderTask(task.name, task.emoji);
        const taskButton = taskList.querySelector('li:first-child button');
        if (task.completed) {
            taskButton.classList.add('completed');
        }
    });

    // Dismiss the modal
    modal.style.display = 'none';
});

    deleteListButton.addEventListener('click', () => {
        const listName = savedListsDropdown.value;
        if (!listName) return;

        localStorage.removeItem(listName);
        updateSavedListsDropdown();
    });

    function updateSavedListsDropdown() {
        savedListsDropdown.innerHTML = '<option value="" disabled selected>Select a saved list</option>';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            savedListsDropdown.appendChild(option);
        }
    }

    updateSavedListsDropdown();
	
	document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.style.display = 'none';
        emojiModal.style.display = 'none';
    }
	});
	
	
	const clearListButton = document.getElementById('clear-list-button');
	const clearListModal = document.getElementById('clear-list-modal');
	const confirmClearButton = document.getElementById('confirm-clear');
	const cancelClearButton = document.getElementById('cancel-clear');

	clearListButton.addEventListener('click', () => {
		clearListModal.style.display = 'block';
	});

	confirmClearButton.addEventListener('click', () => {
		taskList.innerHTML = '';
		clearListModal.style.display = 'none';
	});

	cancelClearButton.addEventListener('click', () => {
		clearListModal.style.display = 'none';
	});

	// Add this to your existing event listener for closing modals with Escape key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			clearListModal.style.display = 'none';
		}
	});
});