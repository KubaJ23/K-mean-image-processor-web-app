
const btn = document.querySelector("#processBtn");
const beforeCanvas = document.querySelector("#originalImage");
const afterCanvas = document.querySelector("#processedImage");
const fileSelector = document.querySelector("#inputImage");
const numberOfColoursInput = document.querySelector("#numberOfColoursInput");
const DepthOfIterationsInput = document.querySelector("#DepthOfIterationsInput");

const ctx1 = beforeCanvas.getContext("2d");
const ctx2 = afterCanvas.getContext("2d");

let numC = 2;
let kMeanDepth = 3;

btn.onclick = processImage;
fileSelector.onchange = showUploadedImage;

function showUploadedImage(){
    if(fileSelector.files.length != 1){
    alert("one image file must be uploaded");
    return;
 }
 const image1 = new Image()
 image1.onload = () => 
 ctx1.drawImage(image1, 0, 0, beforeCanvas.width, beforeCanvas.height)
 image1.src = URL.createObjectURL(fileSelector.files[0]);
}

function processImage(){
    const image = ctx1.getImageData(0, 0, beforeCanvas.width, beforeCanvas.height);
    updateKmeanConfig();
    image.data = KmeanOnImage(image.data, numC, kMeanDepth);
    ctx2.putImageData(image, 0, 0);
}
function updateKmeanConfig(){
    if(numberOfColoursInput.value > 0 && numberOfColoursInput.value != ""){
        numC = Number(numberOfColoursInput.value);
    }

    if(DepthOfIterationsInput.value > 0 && DepthOfIterationsInput.value != ""){
        kMeanDepth = Number(DepthOfIterationsInput.value);
    }
}
// KmeanOnImage returns new altered image data
// image data structure: R   G   B   A | R   G   B   A | R   G   B   A | . . .
function KmeanOnImage(imagedata, numColours, Depth){
    const nodes = new Array(numColours);
    for(let x = 0; x < nodes.length; x++){
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        nodes[x] = new rgbValue(r, g, b);
    }
    const nodeSets = new Array(numColours);

    for(let i = 0; i < Depth; i++){

        for(let x = 0; x < nodeSets.length; x++){
            //each array inside a node's set contains index's of pixels 
            //that belong to a particular node's set
            nodeSets[x] = new Array();
        }

        for(let n = 0; n < imagedata.length; n+=4){
                let indexOfClosestNode;
                let minimumDistanceToNode;

                //find node closest to current pixel in rgb colour space
                for(let m = 0; m < nodes.length; m++){
                    const rd = nodes[m].r - imagedata[n];
                    const gd = nodes[m].g - imagedata[n + 1];
                    const bd = nodes[m].b - imagedata[n + 2];
                    rgbDistance = find3dDistance(rd, gd, bd);
                    if(rgbDistance < minimumDistanceToNode || minimumDistanceToNode === undefined){
                        minimumDistanceToNode = rgbDistance;
                        indexOfClosestNode = m;
                    }
                }
                nodeSets[indexOfClosestNode].push(n);
        }
        nodes.forEach((node, index) => {
            node = findAveragePointOfChosenValuesForrgbaArray(imagedata, nodeSets[index]);
        })
    }
    for(let i = 0; i < nodeSets.length; i++){
        for(let n = 0; n < nodeSets[i].length; n++){
            imagedata[nodeSets[i][n]] = nodes[i].r;
            imagedata[nodeSets[i][n] + 1] = nodes[i].g;
            imagedata[nodeSets[i][n] + 2] = nodes[i].b;
            imagedata[nodeSets[i][n] + 3] = 256;
        }
    }
    return imagedata;
}
function findAveragePointOfChosenValuesForrgbaArray(array, indexesOfArray){
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    indexesOfArray.forEach((index) => {
        sumR += array[index];
        sumG += array[index + 1];
        sumB += array[index + 2];
    })
    const rgb = new rgbValue(
        sumR/indexesOfArray.length, 
        sumG/indexesOfArray.length, 
        sumB/indexesOfArray.length
        )
    return rgb;
}
function find3dDistance(a, b, c){
    return Math.sqrt(a*a + b*b + c*c);
}

class rgbValue{
    constructor(r,g,b){
        this.r = r;
        this.g = g;
        this.b = b;
    }
}