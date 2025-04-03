document.addEventListener('DOMContentLoaded', () => {
    const shellOutput = document.getElementById('shell-output');
    const cursor = document.querySelector('.cursor');

    // --- Text Content for the Shell ---
    // Use spans with classes for potential coloring (optional, but nice)
    // Use \n for new lines
    const lines = [
        { text: '\n$ whoami', type: 'command', delayAfter: 500 },
        { text: '\nmango_developer\n', type: 'output', delayAfter: 200 },
        { text: '$ pwd', type: 'command', delayAfter: 500 },
        { text: '\n/home/mango_developers\n', type: 'output', delayAfter: 200 },
        { text: '$ cat README.md', type: 'command', delayAfter: 500 },
        { text: '\n---\n', type: 'output', delayAfter: 150 },
        { text: '# Welcome to Mango Developers!\n', type: 'output', delayAfter: 150 },
        { text: '\nWe are a passionate group of software developers creating awesome stuff.\n', type: 'output', delayAfter: 150 },
        { text: 'We love clean code, collaboration, and of course, mangoes!\n', type: 'output', delayAfter: 150 },
        { text: '\nFind our work and connect with us via the links below.\n', type: 'output', delayAfter: 150 },
        { text: '---\n', type: 'output', delayAfter: 500 },
        { text: '$ echo "Happy Coding!"', type: 'command', delayAfter: 500 },
        { text: '\nHappy Coding!\n', type: 'output', delayAfter: 1000 }, // Longer pause at the end
        { text: '$ ', type: 'command', delayAfter: 0 } // Final prompt
    ];
    // ------------------------------------


    let lineIndex = 0;
    let charIndex = 0;
    const typingSpeed = 60; // Milliseconds per character

    function typeCharacter() {
        if (lineIndex >= lines.length) {
            cursor.style.animation = 'blink 1s step-end infinite'; // Ensure cursor keeps blinking
            return; // Stop typing if all lines are done
        }

        const currentLine = lines[lineIndex];
        const textToType = currentLine.text;

        // Create a span for styling if needed (optional)
        // const span = document.createElement('span');
        // if (currentLine.type) {
        //     span.className = currentLine.type; // Add class 'command' or 'output'
        // }
        // span.textContent = textToType[charIndex];
        // shellOutput.appendChild(span);

        // Simpler version without span for color:
        shellOutput.textContent += textToType[charIndex];


        charIndex++;

        // Move to the next line?
        if (charIndex >= textToType.length) {
            lineIndex++;
            charIndex = 0;
            // Use the delay specified for the line, or default
            const delay = currentLine.delayAfter || 200;
            setTimeout(typeCharacter, delay);
        } else {
            // Continue typing characters in the current line
            setTimeout(typeCharacter, typingSpeed);
        }
    }

    // Hide cursor during initial setup (optional, prevents seeing it jump)
    // cursor.style.visibility = 'hidden';

    // Start the typing animation after a short delay
    setTimeout(() => {
       // cursor.style.visibility = 'visible';
       cursor.style.animation = 'none'; // Stop blinking during typing
       typeCharacter();
    }, 1000); // 1 second delay before starting

});