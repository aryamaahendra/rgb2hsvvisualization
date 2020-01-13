const fishNormal = document.getElementById("normal");
const fishFormalin = document.getElementById("formalin");
const fishNotFresh = document.getElementById("notFresh");
const btnLogValue = document.getElementById("logValue");
let dataNormalFish = {
	x: [],
	y: [],
	z: []
};
let dataFormalinFish = {
	x: [],
	y: [],
	z: []
};
let dataNotFreshFish = {
	x: [],
	y: [],
	z: []
};

var layout = {
	scene: {
		xaxis: {
			backgroundcolor: "rgb(200, 200, 230)",
			gridcolor: "rgb(255, 255, 255)",
			showbackground: true,
			zerolinecolor: "rgb(255, 255, 255)",
		},
		yaxis: {
			backgroundcolor: "rgb(230, 200,230)",
			gridcolor: "rgb(255, 255, 255)",
			showbackground: true,
			zerolinecolor: "rgb(255, 255, 255)"
		},
		zaxis: {
			backgroundcolor: "rgb(230, 230,200)",
			gridcolor: "rgb(255, 255, 255)",
			showbackground: true,
			zerolinecolor: "rgb(255, 255, 255)"
		}
	}
};

fishNormal.addEventListener("change", doImgFiles, false);
fishFormalin.addEventListener("change", doImgFiles, false);
fishNotFresh.addEventListener("change", doImgFiles, false);
btnLogValue.addEventListener("click", function () {
	console.log(dataNormalFish);
	console.log(dataFormalinFish);
	console.log(dataNotFreshFish)

	const data = [{
			opacity: 0.8,
			type: 'scatter3d',
			x: dataNormalFish.x,
			y: dataNormalFish.y,
			z: dataNormalFish.z,
			mode: 'markers',
			name: 'Normal'
		},
		{
			opacity: 0.8,
			type: 'scatter3d',
			x: dataFormalinFish.x,
			y: dataFormalinFish.y,
			z: dataFormalinFish.z,
			mode: 'markers',
			name: 'Formalin'
		},
		{
			opacity: 0.8,
			type: 'scatter3d',
			x: dataNotFreshFish.x,
			y: dataNotFreshFish.y,
			z: dataNotFreshFish.z,
			mode: 'markers',
			name: 'Tidak Fresh'
		}
	];

	Plotly.newPlot('tester', data, layout);
});


function doImgFiles() {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		let files = this.files;
		const op = this.id;
		console.log("Prossesing " + op);
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			if (file) {
				const reader = new FileReader();
				// Set the image once loaded into file reader
				reader.onload = function (e) {
					let image = new Image();
					image.onload = function (imgEvent) {
						// Resize the image
						let canvas = document.createElement('canvas'),
							max_size = 256, // TODO : pull max size from a site config
							width = image.width,
							height = image.height;
						if (width > height) {
							if (width > max_size) {
								height *= max_size / width;
								width = max_size;
							}
						} else {
							if (height > max_size) {
								width *= max_size / height;
								height = max_size;
							}
						}
						canvas.width = width;
						canvas.height = height;
						canvas.getContext('2d').drawImage(image, 0, 0, width, height);
						const dataUrl = canvas.toDataURL('image/jpeg');
						pushHSV(dataUrl, op)
					}
					image.src = e.target.result;
				}
				reader.readAsDataURL(file);
			} else {
				alert('The File APIs are not fully supported in this browser.');
			}
		}
	}
}

function pushHSV(img, id) {
	const image = new Image();
	image.onload = function () {
		const canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
		const ctx = canvas.getContext('2d');
		const dataRGB = ctx.getImageData(0, 0, image.width, image.height).data;
		let sumHSV = {
			h: 0,
			s: 0,
			v: 0
		};
		let sum = 0;
		// Convert RGB to HSV
		for (let i = 0; i < dataRGB.length; i += 4) {
			const hsv = rgb2hsv(dataRGB[i], dataRGB[i + 1], dataRGB[i + 2]);
			sumHSV.h += Math.floor(hsv.h);
			sumHSV.s += Math.floor(hsv.s);
			sumHSV.v += Math.floor(hsv.v);
			sum++;
		}
		if (id == "normal") {
			dataNormalFish.x.push(sumHSV.h / sum);
			dataNormalFish.y.push(sumHSV.s / sum);
			dataNormalFish.z.push(sumHSV.v / sum);
		} else if (id == "formalin") {
			dataFormalinFish.x.push(sumHSV.h / sum);
			dataFormalinFish.y.push(sumHSV.s / sum);
			dataFormalinFish.z.push(sumHSV.v / sum);
		} else {
			dataNotFreshFish.x.push(sumHSV.h / sum);
			dataNotFreshFish.y.push(sumHSV.s / sum);
			dataNotFreshFish.z.push(sumHSV.v / sum);
		}
		console.log("Done!!!");
	}
	image.src = img;
}

function rgb2hsv(r, g, b) {
	let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
	rabs = r / 255;
	gabs = g / 255;
	babs = b / 255;
	v = Math.max(rabs, gabs, babs),
		diff = v - Math.min(rabs, gabs, babs);
	diffc = c => (v - c) / 6 / diff + 1 / 2;
	percentRoundFn = num => Math.round(num * 100) / 100;
	if (diff == 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rr = diffc(rabs);
		gg = diffc(gabs);
		bb = diffc(babs);

		if (rabs === v) {
			h = bb - gg;
		} else if (gabs === v) {
			h = (1 / 3) + rr - bb;
		} else if (babs === v) {
			h = (2 / 3) + gg - rr;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}
	return {
		h: Math.round(h * 360),
		s: percentRoundFn(s * 100),
		v: percentRoundFn(v * 100)
	};
}