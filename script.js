const links = [
	{ title: "XboxEngine Project", image: "xproj.webp", path: "xproj" },
	{ title: "Racingmaybe", image: "rm.webp", path: "https://store.steampowered.com/app/1261300/Racingmaybe/" },
	{ title: "Racingmaybe 2: Gives Off Speed", image: "rm2.webp", path: "https://github.com/jhoffis/cproj_rm2" },
	{ title: "Very fast grid path finder", image: "fastpath.png", path: "https://github.com/jhoffis/pathfinding" },
	{ title: "Naked Platformer", image: "nakedplatformer.png", path: "nakedplatformer" },
	{ title: "A Platformer Engine", image: "platformer.png", path: "https://jhoffislauda.itch.io/a-platformer-engine" },
	{ title: "Their Disagreement - Boardgame", image: "uenighet.webp", path: "deresuenighet" },
	{ title: "Traderman", image: "traderman.png", path: "traderman" },
	{ title: "Racingmaybe 1.8.3_FINAL (Old Alpha)", image: "rmold.png", path: "http://www.mediafire.com/file/4uogtrek3a1wnw3/racingmaybe_final.zip/file" },
];
let images = [];
let listedLinks = [];
let globalIndex = -1;
let lastImg = { x: 0, y: 0, image: undefined, link: undefined };
const maxAmountImgs = 32;
const listLinksNode = document.getElementById("info");
const body = document.body;
// Add floating title element
const floatingTitle = document.createElement("div");
floatingTitle.id = "floating-title";
document.body.appendChild(floatingTitle);

// Add near the top with other constants
let infoRect = listLinksNode.getBoundingClientRect();
let touchStartX = 0;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Add window resize handler
window.addEventListener('resize', () => {
    infoRect = listLinksNode.getBoundingClientRect();
});

function setFloatingTitlePos(img, x, y) {
    floatingTitle.style.left = x + "px";
    floatingTitle.style.top = (y - (img.offsetHeight/2) - 0) + "px";
}

const activate = (image, x, y) => {
	// update the head of the snake and make the previous head part of the tail	
	image.dataset.status = "current";
	if (lastImg.image !== undefined) {
		lastImg.image.dataset.status = "active";
        lastImg.image.style.opacity = 0.8;
        images.forEach(element => {
            if (element.dataset.status !== "active") return;
            const z = element.style.zIndex - 1;
            element.style.zIndex = z;
            element.style.opacity -= 0.02;
        });
    }
    image.style.opacity = 1.0;
    image.style.zIndex = maxAmountImgs;

	// head of the snake
	image.style.left = x + "px";
	image.style.top = y + "px";
	
	// Position the floating title above the image
    setFloatingTitlePos(image, x, y);
	floatingTitle.innerText = links[globalIndex].title;
	
	// link the website that the head of the snake is pointing to	
	const link = listedLinks[globalIndex];
	link.style.fontWeight = "bolder";
	if (lastImg.link !== undefined) {
		lastImg.link.style.fontWeight = "normal";
	}
	lastImg = { x, y, image, link };
}

const distanceFromLastPos = (x, y) => {
	return Math.hypot(x - lastImg.x, y - lastImg.y);
}

// Modify the window.onmousemove handler
const handleMove = (x, y) => {
    if (isMobile) return; // Skip all movement handling on mobile
    
    // Calculate gradient position based on coordinates
    const gradX = (x / window.innerWidth) * 100;
    const gradY = (y / window.innerHeight) * 100;
    document.body.style.backgroundPosition = `${gradX}% ${gradY}%`;

    // Get current bounds of info div
    infoRect = listLinksNode.getBoundingClientRect();
    const isOverInfo = x >= infoRect.left && 
                      x <= infoRect.right && 
                      y >= infoRect.top && 
                      y <= infoRect.bottom;
    body.style.cursor = isOverInfo ? 'default' : 'none';

    // Always update the position of the current image
    if (lastImg.image !== undefined) {
        lastImg.image.style.left = x + "px";
        lastImg.image.style.top = y + "px";
        setFloatingTitlePos(lastImg.image, x, y);
    }
    
    // Skip the rest of the logic if we're over the info div
    if (isOverInfo) return;
    
    // Only process x-diff when not over info div
    const deltaX = x - lastImg.x;
    const threshold = window.innerWidth * (isMobile ? 0.1 : 0.05);
    
    if (Math.abs(deltaX) > threshold) {
        const direction = deltaX > 0 ? 1 : -1;
        globalIndex = (globalIndex + direction + links.length) % links.length;

        // Create new image element
        const newImage = new Image();
        newImage.dataset.status = "inactive";
        newImage.src = "./imgs/" + links[globalIndex].image;
        newImage.className = "img";
        document.body.appendChild(newImage);
        images.push(newImage);

        activate(newImage, x, y);

        // Remove old images if we exceed maxAmountImgs
        while (images.length > maxAmountImgs) {
            const oldImage = images.shift();
            oldImage.remove();
        }
    }
}

window.onmousemove = e => handleMove(e.clientX, e.clientY);

// Modify the click/tap handler
const handleClick = (e) => {
    if (e.type === 'touchend') {
        e.preventDefault();
    }
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    // go to the head's link
    if (links[globalIndex] !== undefined) {
        document.location.href = links[globalIndex].path;
    }
}

window.onmousedown = handleClick;

// Add this new function to handle link hover
function handleLinkHover(index) {
    if (isMobile) return; // Skip hover handling on mobile
    
    if (globalIndex === index) return; // Don't do anything if it's already the current image
    
    globalIndex = index;
    
    // Create new image element
    const newImage = new Image();
    newImage.dataset.status = "inactive";
    newImage.src = "./imgs/" + links[globalIndex].image;
    newImage.className = "img";
    document.body.appendChild(newImage);
    images.push(newImage);

    // Use the last known mouse position for the new image
    activate(newImage, lastImg.x || window.innerWidth/2, lastImg.y || window.innerHeight/2);

    // Remove old images if we exceed maxAmountImgs
    while (images.length > maxAmountImgs) {
        const oldImage = images.shift();
        oldImage.remove();
    }
}

for (let i = 0; i < links.length; i++) {
	const link = document.createElement("a");
	link.innerText = links[i].title;
	link.href = links[i].path;
	
	if (!isMobile) {
		// Only add hover listeners on desktop
		link.addEventListener('mouseenter', () => handleLinkHover(i));
	}
	
	listLinksNode.appendChild(link);
	listedLinks.push(link);
}

// Remove touch event listeners on mobile
if (!isMobile) {
	window.addEventListener('touchstart', (e) => {
		touchStartX = e.touches[0].clientX;
	}, { passive: true });

	window.addEventListener('touchmove', (e) => {
		e.preventDefault();
		handleMove(e.touches[0].clientX, e.touches[0].clientY);
	}, { passive: false });

	window.addEventListener('touchend', handleClick);
}
