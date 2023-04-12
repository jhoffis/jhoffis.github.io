const links = [
	{ title: "Racingmaybe", image: "rm.jpg", path: "https://store.steampowered.com/app/1261300/Racingmaybe/" },
	{ title: "Racingmaybe 1.8.3_FINAL (Old Alpha)", image: "rmold.png", path: "http://www.mediafire.com/file/4uogtrek3a1wnw3/racingmaybe_final.zip/file" },
	{ title: "A Long Cruise (Old Racingmaybe pre-alpha)", image: "alongcruise.png", path: "alongcruise" },
	{ title: "Naked Platformer", image: "nakedplatformer.png", path: "nakedplatformer" },
	{ title: "Traderman", image: "traderman.png", path: "traderman" },
	{ title: "A Platformer Engine", image: "platformer.png", path: "https://jhoffislauda.itch.io/a-platformer-engine" },
	{ title: "Very fast grid path finder", image: "fastpath.png", path: "https://github.com/jhoffis/pathfinding" },
	{ title: "Their Disagreement - Boardgame", image: "uenighet.jpg", path: "deresuenighet" },
];
let images = [];
let globalIndex = -1;
let lastImg = { x: 0, y: 0, image: undefined };
const maxAmountImgs = 5;
const title = document.getElementById("title");

const activate = (image, x, y) => {
	image.style.left = x + "px";
	image.style.top = y + "px";
	image.style.zIndex++;
	if (image.style.zIndex > images.length) {
		images.forEach(element => {
			element.style.zIndex -= images.length;
		});
	}

	image.dataset.status = "current";
	
	if (lastImg.image !== undefined)
		lastImg.image.dataset.status = "active";
	lastImg = { x, y, image };
}

const distanceFromLastPos = (x, y) => {
	return Math.hypot(x - lastImg.x, y - lastImg.y);
}

window.onmousemove = e => {
	if (distanceFromLastPos(e.clientX, e.clientY) > 128) {
		globalIndex = (globalIndex + 1) % images.length;
		title.innerText = links[globalIndex].title;
		
		const lead = images[globalIndex];
		activate(lead, e.clientX, e.clientY);

		const tail = images[globalIndex >= maxAmountImgs ? 
			globalIndex - maxAmountImgs :
			images.length + (globalIndex - maxAmountImgs)];
		if (tail) {
			tail.dataset.status = "inactive";
		}
	}
}

window.onmousedown = e => {
	if (e.button !== 0)
		return;
	document.location.href = links[globalIndex].path;
}

for (let i = 0; i < links.length; i++) {
	let img = new Image();
	img = document.body.appendChild(img);
	img.dataset.index = i;
	img.dataset.status = "inactive";
	img.src = "./imgs/" + links[i].image;
	img.className = "img";
	images.push(img);
}
