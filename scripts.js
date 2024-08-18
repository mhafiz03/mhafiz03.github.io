document.querySelectorAll('.carousel').forEach(carousel => {
    let currentIndex = 0;
    const slides = carousel.querySelectorAll('.carousel-images img');
    const totalSlides = slides.length;

    function showSlide(index) {
        const offset = -index * 100;
        carousel.querySelector('.carousel-images').style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }

    // Attach event listeners to buttons
    carousel.querySelector('.next').addEventListener('click', nextSlide);
    carousel.querySelector('.prev').addEventListener('click', prevSlide);

    // Optional: Auto slide every 3 seconds
    setInterval(nextSlide, 3000);
});


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size to match the viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Perspective projection parameters
const perspective = 800;
let angleX = 0;
let angleY = 0;
let trailState = 0;
const trailMaxStates = 5;
const colors = ["#ff5733", "#ffdb33", "#33ff57", "#33fff2", "#ff33a8"];
let currentColorIndex = 0;
let nextColorIndex = 1;
let colorTransitionProgress = 0;
const colorTransitionSpeed = 0.004; // Speed of color transition
let scaleIncrement = 0.01; // Increment amount for scaling
let scaling = true; // Flag to control scaling

// Handle scroll event to change color
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Determine scroll percentage
    const scrollPercentage = scrollPosition / maxScroll;

    // Update color based on scroll position
    if (scrollPercentage > 0.2 && scrollPercentage <= 0.4) {
        setColorIndex(1);
    } else if (scrollPercentage > 0.4 && scrollPercentage <= 0.6) {
        setColorIndex(2);
    } else if (scrollPercentage > 0.6 && scrollPercentage <= 0.8) {
        setColorIndex(3);
    } else if (scrollPercentage > 0.8) {
        setColorIndex(4);
    } else {
        setColorIndex(0);
    }
});

function setColorIndex(index) {
    if (currentColorIndex !== index) {
        currentColorIndex = index;
        nextColorIndex = (currentColorIndex + 1) % colors.length;
        colorTransitionProgress = 0; // Reset color transition
    }
}

function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function project(x, y, z, scale) {
    const scaledX = x * scale;
    const scaledY = y * scale;
    const scaledZ = z * scale;
    const projScale = perspective / (perspective + scaledZ);
    return [scaledX * projScale, scaledY * projScale];
}

function draw3DPyramid(angleX, angleY) {
    // Define the vertices of the pyramid
    const baseSize =
        Math.min(canvas.width, canvas.height) / (2 - trailState * 0.2);
    const pyramidHeight = baseSize;

    const vertices = [
        [0, -pyramidHeight / 2, 0], // Top vertex
        [-baseSize / 2, pyramidHeight / 2, -baseSize / 2], // Base vertices
        [baseSize / 2, pyramidHeight / 2, -baseSize / 2],
        [baseSize / 2, pyramidHeight / 2, baseSize / 2],
        [-baseSize / 2, pyramidHeight / 2, baseSize / 2],
    ];

    // Apply rotation around the Y-axis (horizontal rotation)
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    for (let i = 0; i < vertices.length; i++) {
        const x = vertices[i][0] * cosY - vertices[i][2] * sinY;
        const z = vertices[i][0] * sinY + vertices[i][2] * cosY;
        vertices[i][0] = x;
        vertices[i][2] = z;
    }

    // Apply rotation around the X-axis (vertical rotation)
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    for (let i = 0; i < vertices.length; i++) {
        const y = vertices[i][1] * cosX - vertices[i][2] * sinX;
        const z = vertices[i][1] * sinX + vertices[i][2] * cosX;
        vertices[i][1] = y;
        vertices[i][2] = z;
    }

    // Project the 3D vertices onto 2D space
    const scale = 1 + trailState * scaleIncrement; // Apply scaling
    const projected = vertices.map((v) => project(v[0], v[1], v[2], scale));

    // Translate to the center of the canvas
    projected.forEach((p) => {
        p[0] += canvas.width / 2;
        p[1] += canvas.height / 2;
    });

    // Draw the edges of the 3D pyramid
    ctx.beginPath();
    ctx.moveTo(projected[1][0], projected[1][1]); // Base
    ctx.lineTo(projected[2][0], projected[2][1]);
    ctx.lineTo(projected[3][0], projected[3][1]);
    ctx.lineTo(projected[4][0], projected[4][1]);
    ctx.closePath();

    ctx.moveTo(projected[0][0], projected[0][1]); // Sides
    ctx.lineTo(projected[1][0], projected[1][1]);
    ctx.moveTo(projected[0][0], projected[0][1]);
    ctx.lineTo(projected[2][0], projected[2][1]);
    ctx.moveTo(projected[0][0], projected[0][1]);
    ctx.lineTo(projected[3][0], projected[3][1]);
    ctx.moveTo(projected[0][0], projected[0][1]);
    ctx.lineTo(projected[4][0], projected[4][1]);

    ctx.strokeStyle = interpolateColor(
        colors[currentColorIndex],
        colors[nextColorIndex],
        colorTransitionProgress
    );
    ctx.stroke();
}

function animate() {
    // Rotate the pyramid
    angleX += 0.02;
    angleY += 0.02;

    // Adjust trail alpha and base/height scaling
    const trailAlpha = 0.1 - trailState * 0.02;
    ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    draw3DPyramid(angleX, angleY);

    // Increment the color transition
    colorTransitionProgress += colorTransitionSpeed;
    if (colorTransitionProgress >= 1) {
        colorTransitionProgress = 0;
        nextColorIndex = (currentColorIndex + 1) % colors.length;
    }

    if (angleX >= 2 * Math.PI) {
        angleX = 0;
        angleY = 0;
        if (scaling) {
            trailState += 1;
            if (trailState >= trailMaxStates - 1) {
                scaling = false;
            }
        } else {
            trailState -= 1;
            if (trailState <= 0) {
                scaling = true;
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();