let facemesh;
let video;
let predictions = [];


//按钮组件
let isEditMode = false;


let shapeIndex = 0;

let shapes = [{
  fill_H : Math.random(255),
  fill_S : Math.random(255),
  fill_B : Math.random(255),
  fill_O : 100,
  stroke_H : Math.random(255),
  stroke_S : Math.random(255),
  stroke_B : Math.random(255),
  stroke_O : 100,
  indices : []
}];

let dMouse = [];
let closest;
let tParameters;
let isDraggedOver = false;


//语音识别
let recognizer = new p5.SpeechRec();
let continuous = true; //连续识别人声
let interimResults = false; //部分识别（更快，但不太准确）
let speekReg = '';
let totalScore = 0;
//p5.speechRec
console.log("recognizer: ", recognizer);
recognizer.onResult = speechRecognized;//回调函数

function preload(){
  sad = loadImage('img/sad.png');
  cry = loadImage('img/crying.png');
  happy = loadImage('img/happy.png');
  laugh = loadImage('img/laughing.png');
  normal = loadImage('img/normal.png');

  afinn = loadJSON('afinn-111.json');

  avatar = loadJSON('faces/avatar.json');
  clown = loadJSON('faces/clown.json');
  fox = loadJSON('faces/fox.json');
  ghost = loadJSON('faces/ghost.json');
  grey = loadJSON('faces/grey.json');
  Guard = loadJSON('faces/Guard.json');
  operaMask = loadJSON('faces/operaMask.json');
  operaMask2 = loadJSON('faces/operaMask2.json');
  operaMask3 = loadJSON('faces/operaMask3.json');
  panda = loadJSON('faces/panda.json');
  pumpkin = loadJSON('faces/pumpkin.json');
}

function speechRecognized(){
  console.log("人speak");
  console.log(recognizer.resultString);
  speekReg = recognizer.resultString;
  speechSentiment();
}

function speechSentiment(){
  let words = speekReg.split(/\W/);
  console.log(words);

  totalScore = 0;
  for(let i=0; i<words.length; i++){
    let word = words[i].toLowerCase();
    if(afinn.hasOwnProperty(word)){
      let score = afinn[word];
      console.log(word, score);
      totalScore += Number(score);
    }
    console.log("totalScore: ", totalScore);
  }
}

function setup() {
  canvas = createCanvas(1280, 720); //640, 480
  canvas.id('canvas');
  canvas.dragOver(() => {
    isDraggedOver = true;
  });
  canvas.dragLeave(() => {
    isDraggedOver = false;
  });
  canvas.drop((file) => {
    console.log("json文件上传");
    if(file.subtype == 'json'){
      shapes = file.data.shapes;
      console.log("file.data.shape: ", shapes);
      shapeIndex = shapes.length-1;
      isDraggedOver = false;
    }else{
      isDraggedOver = false;
    }
  });
  
  // colorMode(HSB, 360, 100, 100, 100);

  video = createCapture(VIDEO);
  console.log("width+height: ", width, height);
  video.size(width, height);
  // video.id('video');

  //语音识别
  recognizer.start(continuous);

  facemesh = ml5.facemesh(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new predictions are made
  facemesh.on("predict", results => {
    predictions = results;
    // console.log("predictions: ", predictions);
  });

  // Hide the video element, and just show the canvas
  video.hide();

  //按钮组件
  sel_Value = createDiv();
  sel_Value.class("valueDisplay");
  sel = createSelect();
  sel.id("my_selection");
  // sel.position(1310, 0);
  sel.option('avatar');
  sel.option('clown');
  sel.option('fox');
  sel.option('ghost');
  sel.option('grey');
  sel.option('Guard');
  sel.option('operaMask');
  sel.option('operaMask2');
  sel.option('operaMask3');
  sel.option('panda');
  sel.option('pumpkin');

  sel.selected('ghost');
  sel.changed(mySelectEvent);

  edit_button = createButton("编辑");
  edit_button.mousePressed(toggleEdit);
  edit_button.class("Buttons");
  edit_button.id("edit_button");

  fill_H_Value = createDiv();
  fill_H_Value.class("valueDisplay");
  fill_H_Slider = createSlider(0, 255, random(255), 5);
  fill_H_Slider.class("Slider");

  fill_S_Value = createDiv();
  fill_S_Value.class("valueDisplay");
  fill_S_Slider = createSlider(0, 255, 50, 5);
  fill_S_Slider.class("Slider");

  fill_B_Value = createDiv();
  fill_B_Value.class("valueDisplay");
  fill_B_Slider = createSlider(0, 255, 100, 5);
  fill_B_Slider.class("Slider");

  fill_O_Value = createDiv();
  fill_O_Value.class("valueDisplay");
  fill_O_Slider = createSlider(0, 100, 100, 5);
  fill_O_Slider.class("Slider");

  stroke_H_Value = createDiv();
  stroke_H_Value.class("valueDisplay");
  stroke_H_Slider = createSlider(0, 255, random(255), 5);
  stroke_H_Slider.class("Slider");

  stroke_S_Value = createDiv();
  stroke_S_Value.class("valueDisplay");
  stroke_S_Slider = createSlider(0, 255, 50, 5);
  stroke_S_Slider.class("Slider");

  stroke_B_Value = createDiv();
  stroke_B_Value.class("valueDisplay");
  stroke_B_Slider = createSlider(0, 255, 100, 5);
  stroke_B_Slider.class("Slider");

  stroke_O_Value = createDiv();
  stroke_O_Value.class("valueDisplay");
  stroke_O_Slider = createSlider(0, 100, 100, 5);
  stroke_O_Slider.class("Slider");

  screenshot_button = createButton("");
  screenshot_button.mousePressed(screenShot);
  screenshot_button.class("imageButtons");
  screenshot_button.id("screenshot_button");

  save_drawing_button = createButton("");
  save_drawing_button.mousePressed(saveDrawing);
  save_drawing_button.class("imageButtons");
  save_drawing_button.id("save_drawing_button");

  index_UP_button = createButton("");
  index_UP_button.mousePressed(upIndex);
  index_UP_button.class("imageButtons");
  index_UP_button.id("index_UP_button");

  index_DOWN_button = createButton("");
  index_DOWN_button.mousePressed(downIndex);
  index_DOWN_button.class("imageButtons");
  index_DOWN_button.id("index_DOWN_button");

  complete_button = createButton("complete");
  complete_button.mousePressed(complete);
  complete_button.class("Buttons");
  complete_button.id("complete_button");

  undo_button = createButton("undo");
  undo_button.mousePressed(undo);
  undo_button.class("Buttons");
  undo_button.id("undo_button");

  delete_button = createButton("delete");
  delete_button.mousePressed(deleteDrawing);
  delete_button.class("Buttons");
  delete_button.id("delete_button");

  tParameters = {
    fill_H : fill_H_Slider.value(),
    fill_S : fill_S_Slider.value(),
    fill_B : fill_B_Slider.value(),
    fill_O : fill_O_Slider.value(),
    stroke_H : stroke_H_Slider.value(),
    stroke_S : stroke_S_Slider.value(),
    stroke_B : stroke_B_Slider.value(),
    stroke_O : stroke_O_Slider.value()
  }

  textAlign(CENTER, CENTER);
  textSize(24);
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  // clear();
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints
  if(predictions != undefined){
    // console.log("predictions: ", predictions);
    if(predictions[0] != undefined && predictions[0].scaledMesh != undefined && predictions[0].scaledMesh.length > 1){
      drawShapes();
      if(isEditMode == true){  //只有当编辑模式打开时才画出面点集合
        // drawKeypoints();
        faceMesh();
        editShapes();//开始编辑模式，可以画shape
      }
      //
      if(isDraggedOver == true){
        noStroke();
        fill(0, 0, 100, 10);
        rect(0, 0, width, height);
        fill(0, 0, 100);
        text('Drag your drawing here', width/2, height/2);
      }
    }
  }
  sel_Value.html("选择一个面具："+sel.value());

  fill_H_Value.html("填充颜色R: " + fill_H_Slider.value());
  fill_S_Value.html("填充颜色G: " + fill_S_Slider.value());
  fill_B_Value.html("填充颜色B: " + fill_B_Slider.value());
  fill_O_Value.html("填充颜色透明度: " + fill_O_Slider.value());

  stroke_H_Value.html("笔触颜色R: " + stroke_H_Slider.value());
  stroke_S_Value.html("笔触颜色G: " + stroke_S_Slider.value());
  stroke_B_Value.html("笔触颜色B: " + stroke_B_Slider.value());
  stroke_O_Value.html("笔触颜色透明度: " + stroke_O_Slider.value());

  //根据语音识别表情
  if(totalScore < 0){
    //normal表情
    if(-2 <= totalScore){
      //a little sad
      image(sad, width-160, height-160, 150, 150);
    }else{
      //very sad
      image(cry, width-160, height-160, 150, 150);
    }
  }else if(totalScore > 0){
    if(totalScore >= 2){
      // very happy
      image(laugh, width-160, height-160, 150, 150);
    }else{
      //a little happy
      image(happy, width-160, height-160, 150, 150);
    }
  }else{
    //==0
    //normal 表情
    image(normal, width-160, height-160, 150, 150);
  }
}

function faceMesh(){//面点出来之后，画一块块的区域
  stroke('white');//白色的面点
  strokeWeight(4);
  beginShape(POINTS);
  for(let i=0; i<predictions[0].scaledMesh.length; i++){
    let x = predictions[0].scaledMesh[i][0] *2;
    let y = predictions[0].scaledMesh[i][1] *1.5;
    vertex(x, y);

    let d = dist(x, y, mouseX, mouseY); // 计算鼠标点和面点中所有点的两点之间的距离
    // console.log("mouseX, mouseY: ", [mouseX, mouseY]);
    dMouse.push(d);
  }
  endShape();
  // console.log("dMouse: ", dMouse);
  let minimum = min(dMouse);
  closest = dMouse.indexOf(minimum);
  // console.log("cloestX, cloestY: ", [predictions[0].scaledMesh[closest][0] *2, predictions[0].scaledMesh[closest][1]*2]);

  stroke('red');//鼠标选中的点
  strokeWeight(10);
  
  point(
    predictions[0].scaledMesh[closest][0]*2, 
    predictions[0].scaledMesh[closest][1]*1.5
  );

  dMouse.splice(0, dMouse.length); // 清零
}

function mouseClicked(){
  // console.log("mouse clicked: ", [mouseX, mouseY]);
  if(mouseX >= 0 && mouseX <= width){
    if(mouseY >= 0 && mouseY <= height){
      if(isEditMode == true){
        shapes[shapeIndex].indices.push(closest);
      }
    }
  }
}

function drawShapes(){
  for (let s=0; s<shapes.length; s++){
    fill('rgba('+shapes[s].fill_H+','+shapes[s].fill_S+','+shapes[s].fill_B+','+shapes[s].fill_O+')');
    // fill(
    //   shapes[s].fill_H,
    //   shapes[s].fill_S,
    //   shapes[s].fill_B,
    //   shapes[s].fill_O
    // );
    stroke('rgba('+shapes[s].stroke_H+','+shapes[s].stroke_S+','+shapes[s].stroke_B+','+shapes[s].stroke_O+')');
    // stroke(
    //   shapes[s].stroke_H,
    //   shapes[s].stroke_S,
    //   shapes[s].stroke_B,
    //   shapes[s].stroke_O
    // );
    strokeWeight(3);

    if(isEditMode == true){
      if(s == shapeIndex){
        glow('rgba(255, 255, 255, 100)');
      }else{
        glow('rgba(255, 255, 255, 0)');
      }
    }else if(isEditMode == false){
      glow('rgba(255, 255, 255, 100)');
    }

    beginShape();
    for(let i = 0; i < shapes[s].indices.length; i++){
      vertex(
        predictions[0].scaledMesh[shapes[s].indices[i]][0]*2,
        predictions[0].scaledMesh[shapes[s].indices[i]][1]*1.5,
      );
    }
    endShape();
  }
}

function glow(glowColor){
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = glowColor;
}

function editShapes(){
  // --- fill ---
  if(tParameters.fill_H != fill_H_Slider.value()){
    tParameters.fill_H = fill_H_Slider.value();
    shapes[shapeIndex].fill_H = fill_H_Slider.value();
  }
  if(tParameters.fill_S!= fill_S_Slider.value()){
    tParameters.fill_S = fill_S_Slider.value();
    shapes[shapeIndex].fill_S = fill_S_Slider.value();
  }
  if(tParameters.fill_B != fill_B_Slider.value()){
    tParameters.fill_B = fill_B_Slider.value();
    shapes[shapeIndex].fill_B = fill_B_Slider.value();
  }
  if(tParameters.fill_O != fill_O_Slider.value()){
    tParameters.fill_O = fill_O_Slider.value();
    shapes[shapeIndex].fill_O = fill_O_Slider.value();
  }

  // --- stroke ---
  if(tParameters.stroke_H != stroke_H_Slider.value()){
    tParameters.stroke_H = stroke_H_Slider.value();
    shapes[shapeIndex].stroke_H = stroke_H_Slider.value();
  }
  if(tParameters.stroke_S != stroke_S_Slider.value()){
    tParameters.stroke_S = stroke_S_Slider.value();
    shapes[shapeIndex].stroke_S = stroke_S_Slider.value();
  }
  if(tParameters.stroke_B != stroke_B_Slider.value()){
    tParameters.stroke_B = stroke_B_Slider.value();
    shapes[shapeIndex].stroke_B = stroke_B_Slider.value();
  }
  if(tParameters.stroke_O != stroke_O_Slider.value()){
    tParameters.stroke_O = stroke_O_Slider.value();
    shapes[shapeIndex].stroke_O = stroke_O_Slider.value();
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;
    // console.log("keypoints: ", keypoints);
    // Array(3), x\y\z
    // 0: 448.6805419921875
    // 1: 263.125
    // 2: -24.194244384765625

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];
      console.log("[x, y]: ", [x, y]);
      fill(0, 255, 0);
      ellipse(x*2, y*1.5, 5, 5);
    }
  }
}

function keyPressed(){
  if(keyCode === UP_ARROW){
    upIndex();
  }
  if(keyCode === DOWN_ARROW){
    downIndex();
  }
}

function keyTyped(){
  if(key === "e"){
    toggleEdit();
  }
  if(key === "c"){
    complete();
  }
  if(key === "z"){
    undo();
  }
  if(key === "d"){
    deleteDrawing();
  }
  if(key === "s"){
    screenShot();
  }
  if(key === "j"){
    saveDrawing();
  }
}

function mySelectEvent(){
  let item = sel.value();
  console.log("item: ", item);
  
  if(item != undefined){
    if(item == 'avatar'){
      shapes = avatar.shapes;
      console.log("avatar shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'clown'){
      shapes = clown.shapes;
      console.log("clown shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'fox'){
      shapes = fox.shapes;
      console.log("fox shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'ghost'){
      shapes = ghost.shapes;
      console.log("ghost shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'grey'){
      shapes = grey.shapes;
      console.log("grey shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'Guard'){
      shapes = Guard.shapes;
      console.log("Guard shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'operaMask'){
      shapes = operaMask.shapes;
      console.log("operaMask shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'operaMask2'){
      shapes = operaMask2.shapes;
      console.log("operaMask2 shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'operaMask3'){
      shapes = operaMask3.shapes;
      console.log("operaMask3 shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'panda'){
      shapes = panda.shapes;
      console.log("panda shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }else if(item == 'pumpkin'){
      shapes = pumpkin.shapes;
      console.log("pumpkin shapes: ", shapes);
      shapeIndex = shapes.length - 1;
    }
  }
}

function toggleEdit(){
  //打开、关闭编辑模式
  isEditMode = !isEditMode;

  if(isEditMode == true){
    edit_button.html("Edit mode on");
  }else{
    edit_button.html("Edit mode off");

  }
}

function screenShot(){
  //截屏
  image(video.get(0, 0, width, height), 0, 0, width, height);
  //drawShapes();
  //glow();
  saveCanvas('screenShot', 'png');
}

function saveDrawing(){
  let s = {shapes};
  console.log("json: ", s);
  saveJSON(s, 'new_face.json');
}

function upIndex(){
  //转到下一个shape
  if(shapes[shapeIndex] != undefined){
    if(shapes[shapeIndex].indices.length == 0 && shapes.length > 1){
      shapes.splice(shapeIndex, 1);
    }
    if(shapeIndex < shapes.length-1){
      shapeIndex ++;
    }
    resetSliders();
    console.log(shapeIndex);
  }
}

function downIndex(){
  if(shapes[shapeIndex] != undefined){
    if(shapes[shapeIndex].indices.length == 0 && shapes.length > 1){
      shapes.splice(shapeIndex, 1);
    }
    if(shapeIndex > 0){
      shapeIndex --;
    }
    resetSliders();
    console.log(shapeIndex);
  }
}

function complete(){
  console.log("complete button clicked");
  if(shapes[shapes.length-1].indices.length > 0){
    //只有在complete之后才会将组成shapes的所有点集放入indices
    //因此需要前一个shape已经放完点集之后才能放这个shape
    if(shapes[shapeIndex].indices.length == 0 && shapes.length > 1){  //??为什么要shapes.length 与1比较
      shapes.splice(shapeIndex, 1);
    }
    shapes.push({
      fill_H: Math.random(255),
      fill_S : Math.random(255),
      fill_B : Math.random(255),
      fill_O : 100,
      stroke_H : Math.random(255),
      stroke_S : Math.random(255),
      stroke_B : Math.random(255),
      stroke_O : 100,
      indices : []
    });
    shapeIndex = shapes.length - 1;
  }
}

function undo(){
  if(shapes[shapeIndex] != undefined){
    if(shapes[shapeIndex].indices.length > 0){
      shapes[shapeIndex].indices.pop();
    }
  }
}

function deleteDrawing(){
  shapes = [
    {
      fill_H : Math.random(255),
      fill_S : Math.random(255),
      fill_B : Math.random(255),
      fill_O : 100,
      stroke_H : Math.random(255),
      stroke_S : Math.random(255),
      stroke_B : Math.random(255),
      stroke_O : 100,
      indices : []
    }
  ];
  shapeIndex = 0;
  console.log(shapes);
}

function resetSliders(){
  fill_H_Slider.value(shapes[shapeIndex].fill_H);
  fill_S_Slider.value(shapes[shapeIndex].fill_S);
  fill_B_Slider.value(shapes[shapeIndex].fill_B);
  fill_O_Slider.value(shapes[shapeIndex].fill_O);
  stroke_H_Slider.value(shapes[shapeIndex].stroke_H);
  stroke_S_Slider.value(shapes[shapeIndex].stroke_S);
  stroke_B_Slider.value(shapes[shapeIndex].stroke_B);
  stroke_O_Slider.value(shapes[shapeIndex].stroke_O);
}