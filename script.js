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
const maxAmountImgs = 8;
const titleNode = document.getElementById("title");
const listLinksNode = document.getElementById("info2");

const activate = (image, x, y) => {
	// update the head of the snake and make the previous head part of the tail	
	image.dataset.status = "current";
	if (lastImg.image !== undefined)
		lastImg.image.dataset.status = "active";

	// head of the snake
	image.style.left = x + "px";
	image.style.top = y + "px";
	images.forEach(element => {
		const z = element.style.zIndex - 1;
		element.style.zIndex = z;
	});
	image.style.zIndex = maxAmountImgs;

	
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
	const deltaX = e.clientX - lastImg.x;
	if (images[globalIndex] !== undefined) {
		images[globalIndex].style.left = e.clientX + "px";
		images[globalIndex].style.top = e.clientY + "px";
	}
	if (Math.abs(deltaX) > 64) {  // Reduced threshold for horizontal movement
		const direction = deltaX > 0 ? 1 : -1;
		globalIndex = (globalIndex + direction + links.length) % links.length;
		titleNode.innerText = links[globalIndex].title;

		const lead = images[globalIndex];
		activate(lead, e.clientX, e.clientY);

		// Update tail cutoff logic
		const tailIndex = (globalIndex - direction * maxAmountImgs + links.length) % links.length;
		const tail = images[tailIndex];
		if (tail) {
			tail.dataset.status = "inactive";
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
	const img = new Image();
	img.dataset.index = i;
	img.dataset.status = "inactive";
	img.src = "./imgs/" + links[i].image;
	img.className = "img";
	document.body.appendChild(img);
	images.push(img);

	const link = document.createElement("a");
	link.innerText = links[i].title;
	link.href = links[i].path;
	listLinksNode.appendChild(link);
	listedLinks.push(link);
}
