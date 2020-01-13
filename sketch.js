const imgFiles = document.getElementById("imgs")
imgFiles.addEventListener("change", doImgFiles, false)

function doImgFiles() {
   if (window.File && window.FileReader && window.FileList && window.Blob) {
      let files = this.files;
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
                  makeHistogram(dataUrl)
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

function makeHistogram(data) {

   const image = new Image();
   image.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
      const ctx = canvas.getContext('2d');
      const valRGB = ctx.getImageData(0, 0, image.width, image.height).data;

      let label = [],
         valR = [],
         valG = [],
         valB = [];
      for (let i = 0; i < 256; i++) {
         label[i] = i;
         valR[i] = 0;
         valG[i] = 0;
         valB[i] = 0;
      }

      // Convert RGB to HSV
      for (let i = 0; i < valRGB.length; i += 4) {
         const hsv = rgb2hsv(valRGB[i], valRGB[i + 1], valRGB[i + 2]);

         // Nomalisasi Nilai HSV
         valRGB[i] = Math.floor(hsv.h / 2);
         valRGB[i + 1] = Math.floor((hsv.s / 100) * 255);
         valRGB[i + 2] = Math.floor((hsv.v / 100) * 255);
      }

      for (let i = 0; i < valRGB.length; i += 4) {
         valR[valRGB[i]]++;
         valG[valRGB[i + 1]]++;
         valB[valRGB[i + 2]]++;
      }

      // Membuat Histogram Gambar
      drawHistogram([valR, valG, valB], label)
   }
   image.src = data;
}

function drawHistogram(data, label) {
   const canvas = document.createElement('canvas');
   const body = document.getElementsByTagName('body')[0];
   body.appendChild(canvas)
   var ctx = canvas.getContext('2d');
   var myChart = new Chart(ctx, {
      type: 'line',
      data: {
         labels: label,
         datasets: [{
               label: 'Hue',
               data: data[0],
               backgroundColor: 'rgba(255, 0, 0, 0.5)',
               borderColor: 'rgba(255, 0, 0, 1)',
               borderWidth: 1,
               pointRadius: 0,
               fill: false,
               borderWidth: 2
            },
            {
               label: 'Saturation',
               data: data[1],
               backgroundColor: 'rgba(0, 255, 0, 0.5)',
               borderColor: 'rgba(0, 255, 0, 1)',
               borderWidth: 1,
               pointRadius: 0,
               fill: false,
               borderWidth: 2
            },
            {
               label: 'Value',
               data: data[2],
               backgroundColor: 'rgba(0, 0, 255, 0.5)',
               borderColor: 'rgba(0, 0, 255, 1)',
               borderWidth: 1,
               pointRadius: 0,
               fill: false,
               borderWidth: 2
            }
         ]
      },
      options: {
         scales: {
            xAxes: [{
               gridLines: {
                  rawBorder: true,
                  display: false
               },
               ticks: {
                  display: false
               }
            }]
         },
         legend: {
            display: true
         },
         tooltips: {
            callbacks: {
               label: function (tooltipItem) {
                  return tooltipItem.yLabel;
               }
            }
         }
      }
   });
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