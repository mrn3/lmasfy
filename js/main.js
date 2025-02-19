document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    const searchPrompt = document.getElementById('search-prompt');
    const slackInterface = document.getElementById('slack-interface');

    // If there's no query parameter, show the search prompt
    if (!query) {
        searchPrompt.style.display = 'flex';
        slackInterface.style.display = 'none';

        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');

        // Handle search button click
        searchButton.addEventListener('click', handleSearch);
        // Handle enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });

        function handleSearch() {
            const query = searchInput.value.trim();
            if (query) {
                // Redirect to the same page with the query parameter
                window.location.href = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
            }
        }
    } else {
        // If there is a query parameter, show the Slack interface
        searchPrompt.style.display = 'none';
        slackInterface.style.display = 'grid';
        
        // Create cursor element
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);

        // Get textarea position
        const textarea = document.querySelector('.input-box textarea');
        const textareaRect = textarea.getBoundingClientRect();

        // Prepare the full text with @Singularity prefix
        const fullText = `@Singularity ${decodeURIComponent(query)}`;

        // Animation sequence
        setTimeout(() => {
            // Show cursor
            cursor.style.opacity = '1';
            
            // Start at center of viewport
            cursor.style.top = '50%';
            cursor.style.left = '50%';

            // Move to textarea
            setTimeout(() => {
                cursor.style.top = `${textareaRect.top + 30}px`;
                cursor.style.left = `${textareaRect.left + 30}px`;

                // Click effect
                setTimeout(() => {
                    textarea.focus();
                    cursor.style.transform = 'scale(0.9)';
                    
                    // Start typing
                    setTimeout(() => {
                        cursor.style.opacity = '0';
                        typeText(textarea, fullText);
                    }, 500);
                }, 1000);
            }, 500);
        }, 500);

        function typeText(element, text) {
            let index = 0;
            element.value = '';
            
            function type() {
                if (index < text.length) {
                    element.value += text.charAt(index);
                    index++;
                    setTimeout(type, 100); // Adjust typing speed here
                }
            }
            
            type();
        }
    }

    // Create toast element
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast';
    document.body.appendChild(toastContainer);

    function showToast(message, duration = 3000) {
        toastContainer.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${message}
        `;
        toastContainer.classList.add('show');
        
        setTimeout(() => {
            toastContainer.classList.remove('show');
        }, duration);
    }

    // Message input handling
    const textarea = document.querySelector('textarea');
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                showToast('Message sent!');
                textarea.value = '';
            }
        }
    });

    // Attachment handling
    const attachmentBtn = document.querySelector('button[title="Attachment"]');
    const attachmentArea = document.querySelector('.attachment-area');
    
    attachmentBtn.addEventListener('click', () => {
        attachmentArea.classList.toggle('active');
    });

    // Formatting buttons
    const boldBtn = document.querySelector('button[title="Bold"]');
    const italicBtn = document.querySelector('button[title="Italic"]');
    const mentionBtn = document.querySelector('button[title="Mention"]');

    boldBtn.addEventListener('click', () => {
        insertFormatting('**', '**');
    });

    italicBtn.addEventListener('click', () => {
        insertFormatting('_', '_');
    });

    mentionBtn.addEventListener('click', () => {
        insertFormatting('@', '');
    });

    function insertFormatting(prefix, suffix) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const beforeText = text.substring(0, start);
        const selectedText = text.substring(start, end);
        const afterText = text.substring(end);

        textarea.value = beforeText + prefix + selectedText + suffix + afterText;
        textarea.focus();
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
    }

    // Emoji picker toggle
    const emojiBtn = document.querySelector('button[title="Emoji"]');
    emojiBtn.addEventListener('click', () => {
        showToast('Emoji picker opened');
    });

    // Message reactions
    const reactionButtons = document.querySelectorAll('.reaction-button');
    reactionButtons.forEach(button => {
        button.addEventListener('click', () => {
            showToast('Reaction added');
        });
    });

    // Thread view toggle
    const threadButtons = document.querySelectorAll('.thread-button');
    threadButtons.forEach(button => {
        button.addEventListener('click', () => {
            showToast('Thread view opened');
        });
    });

    // Channel switching
    const channels = document.querySelectorAll('.channel');
    channels.forEach(channel => {
        channel.addEventListener('click', () => {
            channels.forEach(c => c.classList.remove('active'));
            channel.classList.add('active');
            const channelName = channel.textContent.trim();
            showToast(`Switched to ${channelName}`);
        });
    });

    // Drag and drop file handling
    const dropArea = document.querySelector('.attachment-area');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        const fileList = [...files];
        showToast(`${fileList.length} file(s) ready to upload`);
        attachmentArea.classList.remove('active');
    }

    // Workspace new message button
    const newMessageBtn = document.querySelector('.new-message');
    newMessageBtn.addEventListener('click', () => {
        showToast('New message dialog opened');
    });
}); 