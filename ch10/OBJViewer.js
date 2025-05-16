// OBJViewer.js (c) 2012 matsuda and itami
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec3 lightDirection = vec3(-0.35, 0.35, 0.87);\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);\n' +
  '}\n';

// Fragment shader program
// 片元着色器
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  // 获取<canvas>元素
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // 获取WebGL的渲染上下文
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the clear color and enable the depth test
  // 设置清除颜色并启用深度测试
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of attribute and uniform variables
  // 获取属性变量和统一变量的存储位置
  var program = gl.program;
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  program.a_Color = gl.getAttribLocation(program, 'a_Color');
  program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
  program.u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');

  if (program.a_Position < 0 ||  program.a_Normal < 0 || program.a_Color < 0 ||
      !program.u_MvpMatrix || !program.u_NormalMatrix) {
    console.log('attribute, uniform変数の格納場所の取得に失敗'); 
    return;
  }

  // Prepare empty buffer objects for vertex coordinates, colors, and normals
  // 为顶点坐标、颜色和法线准备空缓冲区对象
  var model = initVertexBuffers(gl, program);
  if (!model) {
    console.log('Failed to set the vertex information');
    return;
  }

  // ビュー投影行列を計算
  // 计算视图投影矩阵
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 5000.0);
  viewProjMatrix.lookAt(0.0, 500.0, 200.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Start reading the OBJ file
  // 开始读取OBJ文件
  readOBJFile('cube.obj', gl, model, 60, true);

  var currentAngle = 0.0; // Current rotation angle [degree] // 当前旋转角度[度]
  var tick = function() {   // Start drawing // 开始绘制
    currentAngle = animate(currentAngle); // Update current rotation angle // 更新当前旋转角度
    draw(gl, gl.program, currentAngle, viewProjMatrix, model);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

// Create an buffer object and perform an initial configuration
// 创建一个缓冲区对象并进行初始配置
function initVertexBuffers(gl, program) {
  var o = new Object(); // Utilize Object object to return multiple buffer objects
                        // 利用Object对象返回多个缓冲区对象
  o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT); 
  o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
  o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
  o.indexBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
// 创建一个缓冲区对象，将其分配给属性变量，并启用分配
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
  var buffer =  gl.createBuffer();  // Create a buffer object // 创建一个缓冲区对象
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
                                                                // 将缓冲区对象分配给属性变量
  gl.enableVertexAttribArray(a_attribute);  // Enable the assignment // 启用分配

  return buffer;
}

// Read a file
// 读取文件
function readOBJFile(fileName, gl, model, scale, reverse) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status !== 404) {
      onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
    }
  }
  request.open('GET', fileName, true); // Create a request to acquire the file // 创建一个请求以获取文件
  request.send();                      // Send the request // 发送请求
}

var g_objDoc = null;      // The information of OBJ file // OBJ文件的信息
var g_drawingInfo = null; // The information for drawing 3D model // 绘制3D模型的信息

// OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
  var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object // 创建一个OBJDoc对象
  var result = objDoc.parse(fileString, scale, reverse); // Parse the file // 解析文件
  if (!result) {
    g_objDoc = null; g_drawingInfo = null;
    console.log("OBJ file parsing error.");
    return;
  }
  g_objDoc = objDoc;
}

// Coordinate transformation matrix
// 坐标变换矩阵
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

// 描画関数
// 绘制函数
function draw(gl, program, angle, viewProjMatrix, model) {
  if (g_objDoc != null && g_objDoc.isMTLComplete()){ // OBJ and all MTLs are available // OBJ和所有MTL都可用
    g_drawingInfo = onReadComplete(gl, model, g_objDoc);
    g_objDoc = null;
  }
  if (!g_drawingInfo) return;   // モデルを読み込み済みか判定 // 判断模型是否已读取

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers // 清除颜色和深度缓冲区

  g_modelMatrix.setRotate(angle, 1.0, 0.0, 0.0); // 適当に回転 // 适当旋转
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 0.0, 1.0);

  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  // 计算法线变换矩阵并传递给u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  // Calculate the model view project matrix and pass it to u_MvpMatrix
  // 计算模型视图投影矩阵并传递给u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  // Draw // 绘制
  gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

// OBJ File has been read compreatly
// OBJ文件已完全读取
function onReadComplete(gl, model, objDoc) {
  // Acquire the vertex coordinates and colors from OBJ file
  // 从OBJ文件获取顶点坐标和颜色
  var drawingInfo = objDoc.getDrawingInfo();

  // Write date into the buffer object
  // 将数据写入缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
  
  // Write the indices to the buffer object
  // 将索引写入缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

  return drawingInfo;
}

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees) // 旋转角度的增量（度）
var last = Date.now(); // Last time that this function was called // 上次调用此函数的时间
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time // 计算已用时间
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time) // 更新当前旋转角度（根据已用时间调整）
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------

// OBJDoc object
// Constructor
// OBJDoc对象构造器
var OBJDoc = function(fileName) {
  this.fileName = fileName;
  this.mtls = new Array(0);      // Initialize the property for MTL // 初始化MTL的属性
  this.objects = new Array(0);   // Initialize the property for Object // 初始化Object的属性
  this.vertices = new Array(0);  // Initialize the property for Vertex // 初始化Vertex的属性
  this.normals = new Array(0);   // Initialize the property for Normal // 初始化Normal的属性
}

// Parsing the OBJ file
// 解析OBJ文件
OBJDoc.prototype.parse = function(fileString, scale, reverse) {
  var lines = fileString.split('\n');  // Break up into lines and store them as array
                                       // 将文件字符串拆分成行并存储为数组
  lines.push(null); // Append null // 添加null
  var index = 0;    // Initialize index of line // 初始化行索引

  var currentObject = null;
  var currentMaterialName = "";
  
  // Parse line by line
  // 逐行解析
  var line;         // A string in the line to be parsed // 要解析的行中的字符串
  var sp = new StringParser();  // Create StringParser // 创建StringParser
  while ((line = lines[index++]) != null) {
    sp.init(line);                  // init StringParser // 初始化StringParser
	var command = sp.getWord();     // Get command // 获取命令
	if(command == null)	 continue;  // check null command // 检查null命令

    switch(command){
    case '#':
      continue;  // Skip comments // 跳过注释 
    case 'mtllib':     // Read Material chunk // 读取材质块
      var path = this.parseMtllib(sp, this.fileName);
      var mtl = new MTLDoc();   // Create MTL instance // 创建MTL实例
      this.mtls.push(mtl);
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          if (request.status != 404) {
            onReadMTLFile(request.responseText, mtl);
          }else{
            mtl.complete = true;
          }
        }
      }
      request.open('GET', path, true);  // Create a request to acquire the file // 创建一个请求以获取文件
      request.send();                   // Send the request // 发送请求
      continue; // Go to the next line // 转到下一行
    case 'o':
    case 'g':   // Read Object name // 读取对象名称
      var object = this.parseObjectName(sp);
      this.objects.push(object);
      currentObject = object;
      continue; // Go to the next line // 转到下一行
    case 'v':   // Read vertex // 读取顶点
      var vertex = this.parseVertex(sp, scale);
      this.vertices.push(vertex); 
      continue; // Go to the next line // 转到下一行
    case 'vn':   // Read normal // 读取法线
      var normal = this.parseNormal(sp);
      this.normals.push(normal); 
      continue; // Go to the next line // 转到下一行
    case 'usemtl': // Read Material name // 读取材质名称
      currentMaterialName = this.parseUsemtl(sp);
      continue; // Go to the next line // 转到下一行
    case 'f': // Read face // 读取面
      var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
      currentObject.addFace(face);
      continue; // Go to the next line // 转到下一行 
    }
  }

  return true;
}

OBJDoc.prototype.parseMtllib = function(sp, fileName) {
  // Get directory path
  // 获取目录路径
  var i = fileName.lastIndexOf("/");
  var dirPath = "";
  if(i > 0) dirPath = fileName.substr(0, i+1);

  return dirPath + sp.getWord();   // Get path // 获取路径
}

OBJDoc.prototype.parseObjectName = function(sp) {
  var name = sp.getWord();
  return (new OBJObject(name));
}

OBJDoc.prototype.parseVertex = function(sp, scale) {
  var x = sp.getFloat() * scale;
  var y = sp.getFloat() * scale;
  var z = sp.getFloat() * scale;
  return (new Vertex(x, y, z));
}

OBJDoc.prototype.parseNormal = function(sp) {
  var x = sp.getFloat();
  var y = sp.getFloat();
  var z = sp.getFloat();
  return (new Normal(x, y, z));
}

OBJDoc.prototype.parseUsemtl = function(sp) {
  return sp.getWord();
}

OBJDoc.prototype.parseFace = function(sp, materialName, vertices, reverse) {  
  var face = new Face(materialName);
  // get indices // 获取索引
  for(;;){
    var word = sp.getWord();
    if(word == null) break;
    var subWords = word.split('/');
    if(subWords.length >= 1){
      var vi = parseInt(subWords[0]) - 1;
      face.vIndices.push(vi);
    }
    if(subWords.length >= 3){
      var ni = parseInt(subWords[2]) - 1;
      face.nIndices.push(ni);
    }else{
      face.nIndices.push(-1);
    }
  }

  // calc normal // 计算法线
  var v0 = [
    vertices[face.vIndices[0]].x,
    vertices[face.vIndices[0]].y,
    vertices[face.vIndices[0]].z];
  var v1 = [
    vertices[face.vIndices[1]].x,
    vertices[face.vIndices[1]].y,
    vertices[face.vIndices[1]].z];
  var v2 = [
    vertices[face.vIndices[2]].x,
    vertices[face.vIndices[2]].y,
    vertices[face.vIndices[2]].z];

  // 面の法線を計算してnormalに設定 // 计算面法线并设置为normal
  var normal = calcNormal(v0, v1, v2);
  // 法線が正しく求められたか調べる // 检查法线是否正确
  if (normal == null) {
    if (face.vIndices.length >= 4) { // 面が四角形なら別の3点の組み合わせで法線計算
                                     // 如果面是四边形，则使用其他3点的组合计算法线
      var v3 = [
        vertices[face.vIndices[3]].x,
        vertices[face.vIndices[3]].y,
        vertices[face.vIndices[3]].z];
      normal = calcNormal(v1, v2, v3);
    }
    if(normal == null){         // 法線が求められなかったのでY軸方向の法線とする
                                // 如果法线无法求得，则使用Y轴方向的法线
      normal = [0.0, 1.0, 0.0];
    }
  }
  if(reverse){
    normal[0] = -normal[0];
    normal[1] = -normal[1];
    normal[2] = -normal[2];
  }
  face.normal = new Normal(normal[0], normal[1], normal[2]);

  // Devide to triangles if face contains over 3 points.
  // 如果面包含超过3个点，则将其分割为三角形
  if(face.vIndices.length > 3){
    var n = face.vIndices.length - 2;
    var newVIndices = new Array(n * 3);
    var newNIndices = new Array(n * 3);
    for(var i=0; i<n; i++){
      newVIndices[i * 3 + 0] = face.vIndices[0];
      newVIndices[i * 3 + 1] = face.vIndices[i + 1];
      newVIndices[i * 3 + 2] = face.vIndices[i + 2];
      newNIndices[i * 3 + 0] = face.nIndices[0];
      newNIndices[i * 3 + 1] = face.nIndices[i + 1];
      newNIndices[i * 3 + 2] = face.nIndices[i + 2];
    }
    face.vIndices = newVIndices;
    face.nIndices = newNIndices;
  }
  face.numIndices = face.vIndices.length;

  return face;
}

// Analyze the material file
// 分析材质文件
function onReadMTLFile(fileString, mtl) {
  var lines = fileString.split('\n');  // Break up into lines and store them as array
                                       // 将文件字符串拆分成行并存储为数组
  lines.push(null);           // Append null // 添加null
  var index = 0;              // Initialize index of line // 初始化行索引

  // Parse line by line // 逐行解析
  var line;      // A string in the line to be parsed // 要解析的行中的字符串 
  var name = ""; // Material name // 材质名称
  var sp = new StringParser();  // Create StringParser // 创建StringParser
  while ((line = lines[index++]) != null) {
    sp.init(line);                  // init StringParser // 初始化StringParser
    var command = sp.getWord();     // Get command // 获取命令
    if(command == null)	 continue;  // check null command // 检查null命令

    switch(command){
    case '#':
      continue;    // Skip comments // 跳过注释
    case 'newmtl': // Read Material chunk // 读取材质块
      name = mtl.parseNewmtl(sp);    // Get name // 获取名称
      continue; // Go to the next line // 转到下一行
    case 'Kd':   // Read normal // 读取法线
      if(name == "") continue; // Go to the next line because of Error // 因为错误转到下一行
      var material = mtl.parseRGB(sp, name);
      mtl.materials.push(material);
      name = "";
      continue; // Go to the next line // 转到下一行
    }
  }
  mtl.complete = true;
}

// Check Materials
// 检查材质
OBJDoc.prototype.isMTLComplete = function() {
  if(this.mtls.length == 0) return true;
  for(var i = 0; i < this.mtls.length; i++){
    if(!this.mtls[i].complete) return false;
  }
  return true;
}

// Find color by material name
// 按材质名称查找颜色
OBJDoc.prototype.findColor = function(name){
  for(var i = 0; i < this.mtls.length; i++){
    for(var j = 0; j < this.mtls[i].materials.length; j++){
      if(this.mtls[i].materials[j].name == name){
        return(this.mtls[i].materials[j].color)
      }
    }
  }
  return(new Color(0.8, 0.8, 0.8, 1));
}

//------------------------------------------------------------------------------
// Retrieve the information for drawing 3D model
// 检索用于绘制3D模型的信息
OBJDoc.prototype.getDrawingInfo = function() {
  // Create an arrays for vertex coordinates, normals, colors, and indices
  // 创建用于存储顶点坐标、法线、颜色和索引的数组
  var numIndices = 0;
  for(var i = 0; i < this.objects.length; i++){
    numIndices += this.objects[i].numIndices;
  }
  var numVertices = numIndices;
  var vertices = new Float32Array(numVertices * 3);
  var normals = new Float32Array(numVertices * 3);
  var colors = new Float32Array(numVertices * 4);
  var indices = new Uint16Array(numIndices);

  // Set vertex, normal and color
  // 设置顶点，法线和颜色
  var index_indices = 0;
  for(var i = 0; i < this.objects.length; i++){
    var object = this.objects[i];
    for(var j = 0; j < object.faces.length; j++){
      var face = object.faces[j];
      var color = this.findColor(face.materialName);
      var faceNormal = face.normal;
      for(var k = 0; k < face.vIndices.length; k++){
        // Set index // 设置索引
        indices[index_indices] = index_indices;
        // Copy vertex // 复制顶点
        var vIdx = face.vIndices[k];
        var vertex = this.vertices[vIdx];
        vertices[index_indices * 3 + 0] = vertex.x;
        vertices[index_indices * 3 + 1] = vertex.y;
        vertices[index_indices * 3 + 2] = vertex.z;
        // Copy color // 复制颜色
        colors[index_indices * 4 + 0] = color.r;
        colors[index_indices * 4 + 1] = color.g;
        colors[index_indices * 4 + 2] = color.b;
        colors[index_indices * 4 + 3] = color.a;
        // Copy normal // 复制法线
        var nIdx = face.nIndices[k];
        if(nIdx >= 0){
          var normal = this.normals[nIdx];
          normals[index_indices * 3 + 0] = normal.x;
          normals[index_indices * 3 + 1] = normal.y;
          normals[index_indices * 3 + 2] = normal.z;
        }else{
          normals[index_indices * 3 + 0] = faceNormal.x;
          normals[index_indices * 3 + 1] = faceNormal.y;
          normals[index_indices * 3 + 2] = faceNormal.z;
        }
        index_indices ++;
      }
    }
  }

  return new DrawingInfo(vertices, normals, colors, indices);
}

//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
var MTLDoc = function() {
  this.complete = false; // MTL is configured correctly // MTL配置正确
  this.materials = new Array(0);
}

MTLDoc.prototype.parseNewmtl = function(sp) {
  return sp.getWord();         // Get name // 获取名字
}

MTLDoc.prototype.parseRGB = function(sp, name) {
  var r = sp.getFloat();
  var g = sp.getFloat();
  var b = sp.getFloat();
  return (new Material(name, r, g, b, 1));
}

//------------------------------------------------------------------------------
// Material Object
//------------------------------------------------------------------------------
var Material = function(name, r, g, b, a) {
  this.name = name;
  this.color = new Color(r, g, b, a);
}

//------------------------------------------------------------------------------
// Vertex Object
//------------------------------------------------------------------------------
var Vertex = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

//------------------------------------------------------------------------------
// Normal Object
//------------------------------------------------------------------------------
var Normal = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

//------------------------------------------------------------------------------
// Color Object
//------------------------------------------------------------------------------
var Color = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
var OBJObject = function(name) {
  this.name = name;
  this.faces = new Array(0);
  this.numIndices = 0;
}

OBJObject.prototype.addFace = function(face) {
  this.faces.push(face);
  this.numIndices += face.numIndices;
}

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
var Face = function(materialName) {
  this.materialName = materialName;
  if(materialName == null)  this.materialName = "";
  this.vIndices = new Array(0);
  this.nIndices = new Array(0);
}

//------------------------------------------------------------------------------
// DrawInfo Object
//------------------------------------------------------------------------------
var DrawingInfo = function(vertices, normals, colors, indices) {
  this.vertices = vertices;
  this.normals = normals;
  this.colors = colors;
  this.indices = indices;
}

//------------------------------------------------------------------------------
// Constructor
var StringParser = function(str) {
  this.str;   // Store the string specified by the argument // 存储指定字符串
  this.index; // Position in the string to be processed // 字符串中的位置
  this.init(str);
}
// Initialize StringParser object
// 初始化StringParser对象
StringParser.prototype.init = function(str){
  this.str = str;
  this.index = 0;
}

// Skip delimiters
// 跳过分隔符
StringParser.prototype.skipDelimiters = function()  {
  for(var i = this.index, len = this.str.length; i < len; i++){
    var c = this.str.charAt(i);
    // Skip TAB, Space, '(', ')
    if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"') continue;
    break;
  }
  this.index = i;
}

// Skip to the next word
// 跳转到下一个单词
StringParser.prototype.skipToNextWord = function() {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  this.index += (n + 1);
}

// Get word
// 获取单词
StringParser.prototype.getWord = function() {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  if (n == 0) return null;
  var word = this.str.substr(this.index, n);
  this.index += (n + 1);

  return word;
}

// Get integer
// 获取整数
StringParser.prototype.getInt = function() {
  return parseInt(this.getWord());
}

// Get floating number
// 获取浮点数
StringParser.prototype.getFloat = function() {
  return parseFloat(this.getWord());
}

// Get the length of word
// 获取单词长度
function getWordLength(str, start) {
  var n = 0;
  for(var i = start, len = str.length; i < len; i++){
    var c = str.charAt(i);
    if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"') 
	break;
  }
  return i - start;
}

//------------------------------------------------------------------------------
// Common function
//------------------------------------------------------------------------------
function calcNormal(p0, p1, p2) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  // v0: 从p1到p0的向量, v1: 从p1到p2的向量
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);
  for (var i = 0; i < 3; i++){
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  // v0和v1的叉积
  var c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  // 归一化结果
  var v = new Vector3(c);
  v.normalize();
  return v.elements;
}
