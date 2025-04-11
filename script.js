document.addEventListener('DOMContentLoaded', () => {
    const shellOutput = document.getElementById('shell-output');
    const cursor = document.querySelector('.cursor');

    // --- Text Content for the Shell ---
    // Use spans with classes for potential coloring (optional, but nice)
    // Use \n for new lines
    const lines = [
        { text: '\n> whoami', type: 'command', delayAfter: 500 },
        { text: '\nmango_developers\n', type: 'output', delayAfter: 200 },
        { text: '> pwd', type: 'command', delayAfter: 500 },
        { text: '\n/home/mango_developers\n', type: 'output', delayAfter: 200 },
        { text: '> cat README.md', type: 'command', delayAfter: 500 },
        { text: '\n---\n', type: 'output', delayAfter: 0 },
        { text: '# Welcome to Mango Developers!\n', type: 'output', delayAfter: 50 },
        { text: 'We are a passionate group of software developers creating awesome stuff.\n', type: 'output', delayAfter: 50 },
        { text: 'We love coding, collaboration, and of course, the mango feeling!\n', type: 'output', delayAfter: 50 },
        { text: '\nFind our work and connect with us via the links below.\n', type: 'output', delayAfter: 50 },
        { text: '---\n', type: 'output', delayAfter: 500 },
        { text: '> echo $WHAT_IS_MANGO', type: 'command', delayAfter: 500 },
        { text: '\nWhat is Mango?\n', type: 'output', delayAfter: 150 },
        { text: 'A sweet feeling that cannot be expressed in words,\nbut can still be shared with everyone.\n', type: 'output', delayAfter: 1000 }, // Longer pause at the end
        { text: '> ', type: 'command', delayAfter: 0 } // Final prompt
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

// --- Particle Background Animation ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;

// Mouse position
const mouse = {
    x: null,
    y: null,
    radius: 100 // Interaction radius
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Particle class
class Particle {
    constructor(x, y, size, color, weight) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.weight = weight; // Use weight to influence speed slightly
        // Assign random initial direction and speed
        this.directionX = (Math.random() * 0.8) - 0.4; // Random horizontal velocity (-0.4 to 0.4)
        this.directionY = (Math.random() * 0.8) - 0.4; // Random vertical velocity (-0.4 to 0.4)
    }

    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Check particle position, check mouse position, move the particle, draw the particle
    update() {
        // Boundary check (bounce off edges) - Do this first
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
            this.directionX = -this.directionX; // Reverse horizontal direction
        }
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {
            this.directionY = -this.directionY; // Reverse vertical direction
        }

        // Apply inherent movement
        this.x += this.directionX * this.weight * 0.5; // Apply inherent velocity (scaled by weight)
        this.y += this.directionY * this.weight * 0.5;

        // --- Mouse Interaction ---
        let dxMouse = mouse.x - this.x;
        let dyMouse = mouse.y - this.y;
        let distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        // Check if mouse is within radius
        if (distanceMouse < mouse.radius && mouse.x != null) { // Check mouse.x != null to avoid NaN issues on mouseout
            let forceDirectionX = dxMouse / distanceMouse;
            let forceDirectionY = dyMouse / distanceMouse;

            // Calculate repulsion force - stronger closer to mouse
            let maxDistance = mouse.radius;
            let force = (maxDistance - distanceMouse) / maxDistance; // Force is 0 at radius edge, 1 at center

            let repulsionX = forceDirectionX * force * this.weight * 5; // Increased repulsion strength
            let repulsionY = forceDirectionY * force * this.weight * 5;

            // Apply repulsion force (move away from mouse)
            this.x -= repulsionX;
            this.y -= repulsionY;

             // Slightly dampen inherent velocity when repelled to prevent excessive speed
             this.directionX *= 0.98;
             this.directionY *= 0.98;

        }
        // --- End Mouse Interaction ---


        // Ensure particles don't get stuck out of bounds after repulsion/bounce
        if (this.x - this.size < 0) { this.x = this.size; this.directionX *= -1; }
        if (this.x + this.size > canvas.width) { this.x = canvas.width - this.size; this.directionX *= -1; }
        if (this.y - this.size < 0) { this.y = this.size; this.directionY *= -1; }
        if (this.y + this.size > canvas.height) { this.y = canvas.height - this.size; this.directionY *= -1; }


        this.draw();
    }
}

// Initialization function
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000; // Adjust density
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1; // Particle size
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let color = 'rgba(173, 216, 230, 0.6)'; // Light blue with transparency
        let weight = (Math.random() * 1.5) + 0.5; // Random weight for varied movement
        particlesArray.push(new Particle(x, y, size, color, weight));
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect(); // Draw lines between particles
}

// Draw lines between nearby particles
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                         + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width/7) * (canvas.height/7)) { // Adjust connection distance
                opacityValue = 1 - (distance/20000); // Fade lines with distance
                if (opacityValue < 0) opacityValue = 0; // Clamp opacity
                if (opacityValue > 0.3) opacityValue = 0.3; // Max opacity for lines
                ctx.strokeStyle = 'rgba(173, 216, 230, ' + opacityValue + ')'; // Light blue lines
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}


// Resize event
window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    mouse.radius = ((canvas.height/80) * (canvas.height/80)); // Adjust interaction radius on resize
    init(); // Reinitialize particles on resize
});

// Reset mouse position when mouse leaves window
window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Start animation
init();
animate();