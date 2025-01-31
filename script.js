const links = [
	{ title: "Racingmaybe", image: "rm.jpg", path: "https://store.steampowered.com/app/1261300/Racingmaybe/" },
	{ title: "Racingmaybe 1.8.3_FINAL (Old Alpha)", image: "rmold.png", path: "http://www.mediafire.com/file/4uogtrek3a1wnw3/racingmaybe_final.zip/file" },
	{ title: "A Long Cruise (Old Racingmaybe pre-alpha)", image: "alongcruise.png", path: "alongcruise" },
	{ title: "Naked Platformer", image: "nakedplatformer.png", path: "nakedplatformer" },
	{ title: "Traderman", image: "traderman.png", path: "traderman" },
	{ title: "A Platformer Engine", image: "platformer.png", path: "https://jhoffislauda.itch.io/a-platformer-engine" },
	{ title: "Very fast grid path finder", image: "fastpath.png", path: "https://github.com/jhoffis/pathfinding" },
	{ title: "Their Disagreement - Boardgame", image: "uenighet.jpg", path: "deresuenighet" },
	{ title: "XboxEngine Project", image: "xproj.jpg", path: "xproj" },
];
let images = [];
let listedLinks = [];
let globalIndex = -1;
let lastImg = { x: 0, y: 0, image: undefined, link: undefined };
const maxAmountImgs = 32;
const listLinksNode = document.getElementById("info");
// Add floating title element
const floatingTitle = document.createElement("div");
floatingTitle.id = "floating-title";
document.body.appendChild(floatingTitle);

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

window.onmousemove = e => {
    // Calculate gradient position based on mouse coordinates
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.body.style.backgroundPosition = `${x}% ${y}%`;

    // Existing mouse movement logic
    const deltaX = e.clientX - lastImg.x;
    if (lastImg.image !== undefined) {
        lastImg.image.style.left = e.clientX + "px";
        lastImg.image.style.top = e.clientY + "px";
        setFloatingTitlePos(lastImg.image, e.clientX, e.clientY);
    }
    
    // Use 5% of window width as threshold instead of fixed 64px
    const threshold = window.innerWidth * 0.05;
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

        activate(newImage, e.clientX, e.clientY);

        // Remove old images if we exceed maxAmountImgs
        while (images.length > maxAmountImgs) {
            const oldImage = images.shift();
            oldImage.remove();
        }
    }
}

window.onmousedown = e => {
	if (e.button !== 0)
		return;
	// go to the head's link
	document.location.href = links[globalIndex].path;
}

for (let i = 0; i < links.length; i++) {
	const link = document.createElement("a");
	link.innerText = links[i].title;
	link.href = links[i].path;
	listLinksNode.appendChild(link);
	listedLinks.push(link);
}
