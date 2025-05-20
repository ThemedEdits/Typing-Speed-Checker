document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeSwitcher = document.getElementById('theme-switcher');
    const textDisplay = document.getElementById('text-display');
    const sampleText = document.getElementById('sample-text');
    const userInput = document.getElementById('user-input');
    const restartBtn = document.getElementById('restart-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const resultContainer = document.getElementById('result-container');
    const wpmDisplay = document.getElementById('wpm');
    const timeDisplay = document.getElementById('time');
    const accuracyDisplay = document.getElementById('accuracy');
    const finalWpm = document.getElementById('final-wpm');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalKeystrokes = document.getElementById('final-keystrokes');
    const finalCpm = document.getElementById('final-cpm');
    const notification = document.getElementById('notification');

    // Sample texts
    const sampleTexts = [
    "Subterranean civilizations may theoretically exist, yet empirical evidence remains inconclusive despite extensive geological and anthropological investigations into Earth's crust.",
    "Cryptographers emphasize algorithmic complexity and key management as pivotal to the integrity and confidentiality of modern digital communication systems.",
    "Despite advancements in neuroplasticity research, cognitive resilience under acute psychological duress remains an enigma in contemporary behavioral science.",
    "Quantum entanglement challenges classical intuitions of locality and causality, provoking philosophical debates alongside empirical exploration in theoretical physics.",
    "The juxtaposition of minimalist aesthetics and maximalist utility characterizes modern industrial design across high-performance consumer technology sectors.",
    "Synthetic biology integrates engineering principles into genomics, allowing programmable manipulation of organisms for environmental, medicinal, and agricultural innovation.",
    "Epistemological skepticism demands rigorous scrutiny of perceived truths, compelling philosophers to reassess foundational assumptions in human knowledge systems.",
    "Automated reasoning and machine inference algorithms underpin artificial intelligence, revolutionizing data analysis, predictive modeling, and decision-making frameworks.",
    "Decentralized blockchain architectures offer immutable ledgers, reshaping digital trust, asset management, and cross-border transactional ecosystems.",
    "Astrophysical anomalies like dark matter and dark energy defy conventional cosmological models, suggesting profound gaps in our understanding of the universe."
];


    // App state
    let timer;
    let timeLeft = 60;
    let isTyping = false;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let currentCharIndex = 0;
    let currentText = '';

    // Initialize the app
    init();

    const themeToggleCheckbox = document.querySelector('.switch input');

    themeToggleCheckbox.addEventListener('change', () => {
        const isDark = themeToggleCheckbox.checked;
        const newTheme = isDark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);

        showNotification(`Switched to ${newTheme} mode`);
    });



    // Restart button
    restartBtn.addEventListener('click', resetTest);
    tryAgainBtn.addEventListener('click', resetTest);

    // User input handling
    userInput.addEventListener('input', handleInput);
    userInput.addEventListener('focus', startTest);
    userInput.addEventListener('blur', pauseTest);

    // Initialize the typing test
    function init() {
        loadRandomText();
        updateDisplay();
    }
    

    // Load a random sample text
    function loadRandomText() {
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        currentText = sampleTexts[randomIndex];
        sampleText.innerHTML = '';

        currentText.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            sampleText.appendChild(span);
        });

        resetTest();
    }

    // Start the typing test
    function startTest() {
        if (!isTyping && timeLeft > 0) {
            isTyping = true;
            timer = setInterval(updateTimer, 1000);
            showNotification('Test started! Type away...');
        }
    }

    // Pause the typing test
    function pauseTest() {
        if (isTyping) {
            isTyping = false;
            clearInterval(timer);
            showNotification('Test paused. Click to continue...');
        }
    }

    // Update the timer
    function updateTimer() {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endTest();
        }
    }

    // Handle user input
    function handleInput(e) {
        if (!isTyping) startTest();

        const inputText = e.target.value;
        const currentChar = inputText[inputText.length - 1];

        // Backspace handling
        if (inputText.length < totalKeystrokes) {
            if (currentCharIndex > 0) {
                currentCharIndex--;
                sampleText.children[currentCharIndex].classList.remove('correct', 'incorrect', 'active');
            }
            totalKeystrokes++;
            updateDisplay();
            return;
        }

        // Check if the character is correct
        if (currentCharIndex < currentText.length) {
            const expectedChar = currentText[currentCharIndex];
            const charSpan = sampleText.children[currentCharIndex];

            charSpan.classList.add('active');

            if (currentChar === expectedChar) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
                correctKeystrokes++;
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
            }

            // Remove active class from previous character
            if (currentCharIndex > 0) {
                sampleText.children[currentCharIndex - 1].classList.remove('active');
            }

            currentCharIndex++;
            totalKeystrokes++;

            // Auto-scroll to keep current character visible
            if (charSpan.offsetTop > textDisplay.scrollTop + textDisplay.offsetHeight - 30) {
                textDisplay.scrollTop = charSpan.offsetTop - textDisplay.offsetHeight + 50;
            }
        }

        // Update stats
        updateDisplay();

        // Check if test is complete
        if (currentCharIndex === currentText.length) {
            endTest();
        }
    }

    // Update the display with current stats
    function updateDisplay() {
        // Calculate WPM (5 characters = 1 word)
        const minutes = (60 - timeLeft) / 60 || 1;
        const wpm = Math.round((correctKeystrokes / 5) / minutes);
        wpmDisplay.textContent = wpm;

        // Calculate accuracy
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;
        accuracyDisplay.textContent = accuracy;
    }

    // End the typing test
    function endTest() {
        clearInterval(timer);
        isTyping = false;
        userInput.disabled = true;

        // Calculate final stats
        const minutes = (60 - timeLeft) / 60 || 1;
        const wpm = Math.round((correctKeystrokes / 5) / minutes);
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;
        const cpm = Math.round(correctKeystrokes / minutes);

        // Display final results
        finalWpm.textContent = wpm;
        finalAccuracy.textContent = accuracy + '%';
        finalKeystrokes.textContent = totalKeystrokes;
        finalCpm.textContent = cpm;

        // Show result container with animation
        resultContainer.classList.remove('hidden');
        resultContainer.style.animation = 'pulse 0.5s ease';

        setTimeout(() => {
            resultContainer.style.animation = '';
        }, 500);

        showNotification('Test completed! Check your results.');
    }

    // Reset the typing test
    function resetTest() {
        clearInterval(timer);

        // Reset state
        timeLeft = 60;
        isTyping = false;
        totalKeystrokes = 0;
        correctKeystrokes = 0;
        currentCharIndex = 0;

        // Reset UI
        userInput.value = '';
        userInput.disabled = false;
        timeDisplay.textContent = timeLeft;
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '0';
        resultContainer.classList.add('hidden');

        // Reset text display
        const spans = sampleText.querySelectorAll('span');
        spans.forEach(span => {
            span.classList.remove('correct', 'incorrect', 'active');
        });

        // Focus on input
        userInput.focus();
    }

    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});


