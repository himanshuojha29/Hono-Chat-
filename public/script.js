let count = null;
const socket = io()

socket.on("receive-msg", (data) => {
    hideTyping();
    setTimeout(() => {
        appendMessage(data, "assistant")
    }, 400)

})

socket.on("user-connected", (data)=>{
    count.textContent = data ;
})

let time = null
socket.on("typing", () => {
    showTyping()
    if (time) {
        clearTimeout(time)
    }
    time = setTimeout(() => {
        hideTyping()
    }, 2000)
})


socket.on("clear-chat", ()=>{
    clearChat()
})

socket.on("user-connected",{

})


function appendMessage(content, sender = 'assistant') {
    const chatMessages = document.getElementById('chatMessages');
    const typingContainer = document.getElementById('typingContainer');

    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = ` message ${sender}`;

    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? 'U' : 'AI';

    // Create message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    // Assemble message
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    // Insert before typing container
    if (typingContainer && chatMessages.contains(typingContainer)) {
        chatMessages.insertBefore(messageDiv, typingContainer);
    } else {
        chatMessages.appendChild(messageDiv);
    }

    // Scroll to bottom
    scrollToBottom();
}

async function deleteChat(e) {
    let ans =  await prompt("Type 'mine' to delete your chat or type 'all' to delete everyones chat")
  
    if (ans === "mine") {
        clearChat()
    } else if(ans === "all"){
         socket.emit("clear-chat")
    }else{
        console.log("Invalid input. no chats were deleted");
    }
    
}

// Function to clear all chat messages
function clearChat() {

    const chatMessages = document.getElementById('chatMessages');
    const messages = chatMessages.querySelectorAll('.message');

    // Remove all messages except the first one (welcome message)
    messages.forEach((message, index) => {
        if (index > 0) {
            message.remove();
        }
    });

    // Hide typing indicator
    hideTyping();

    // Clear input
    const messageInput = document.getElementById('messageInput');
    messageInput.value = '';
    messageInput.style.height = 'auto';
}

// Function to scroll chat to bottom
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Function to show typing indicator
function showTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }
}


// Function to hide typing indicator
function hideTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// Send message function
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) return;

    // Add user message (appears on right side)
    appendMessage(message, 'user');

    socket.emit("send-msg", messageInput.value)

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Show typing indicator
    // showTyping();

    // Here you can add your API call to Ollama
    // Example: callOllamaAPI(message);
}

// Function to add AI response (appears on left side)
function addAIResponse(response) {
    hideTyping();
    appendMessage(response, 'assistant');
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Auto-resize textarea
function autoResizeTextarea() {

    socket.emit("typing")

    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('sendButton');
    const clearButton = document.getElementById('clearButton');
    const messageInput = document.getElementById('messageInput');
    count = document.getElementById("cnt");

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Clear button click
    clearButton.addEventListener('click', deleteChat);

    // Enter key to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', debounce(autoResizeTextarea, 300));
});