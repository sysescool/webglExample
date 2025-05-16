// HUD.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform bool u_Clicked;\n' + // Mouse is pressed // 鼠标是否按下
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  if (u_Clicked) {\n' + //  Draw in red if mouse is pressed // 如果鼠标按下，绘制红色
  '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '  } else {\n' +
  '    v_Color = a_Color;\n' +
  '  }\n' +
  '}\n';

// Fragment shader program
// 片段着色器
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var ANGLE_STEP = 20.0; // Rotation angle (degrees/second)
                       // 旋转角度（度/秒）
function main() {
  // Retrieve <canvas> element
  // 获取<canvas>元素
  var canvas = document.getElementById('webgl');
  var hud = document.getElementById('hud');  

  if (!canvas || !hud) { 
    console.log('Failed to get HTML elements');
    return false; 
  } 

  // Get the rendering context for WebGL
  // 获取WebGL的渲染上下文
  var gl = getWebGLContext(canvas);
  // Get the rendering context for 2DCG
  // 获取2D渲染上下文
  var ctx = hud.getContext('2d');
  if (!gl || !ctx) {
    console.log('Failed to get rendering context');
    return;
  }

  // Initialize shaders
  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  // 设置顶点信息
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  // 设置清除颜色并启用深度测试
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  // 获取uniform变量的存储位置
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
  if (!u_MvpMatrix || !u_Clicked) { 
    console.log('Failed to get the storage location of uniform variables');
    return;
  }

  // Calculate the view projection matrix
  // 计算视图投影矩阵
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked // 传递false给u_Clicked

  var currentAngle = 0.0; // Current rotation angle // 当前旋转角度
  // Register the event handler // 注册事件处理程序
  hud.onmousedown = function(ev) {   // Mouse is pressed // 鼠标按下
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect()
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If pressed position is inside <canvas>, check if it is above object
      // 如果按下的位置在<canvas>内，检查是否在物体上方
      var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
      if (picked) alert('The cube was selected! '); }
  }

  var tick = function() {   // Start drawing // 开始绘制
    currentAngle = animate(currentAngle);
    draw2D(ctx, currentAngle); // Draw 2D // 绘制2D
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([   // Colors
    0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
    0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Write the vertex property to buffers (coordinates and normals)
  // 将顶点属性写入缓冲区（坐标和法向量）
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Coordinates // 坐标
  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;      // Color Information // 颜色信息

  // Create a buffer object
  // 创建一个缓冲区对象
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }
  // Write the indices to the buffer object
  // 将索引写入缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function check(gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) {
  var picked = false;
  gl.uniform1i(u_Clicked, 1);  // Pass true to u_Clicked(Draw cube with red)
                               // 传递true给u_Clicked（绘制红色立方体）
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
  // Read pixel at the clicked position
  // 读取点击位置的像素
  var pixels = new Uint8Array(4); // Array for storing the pixel value
                                  // 存储像素值的数组
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (pixels[0] == 255) // If red = 255, clicked on cube // 如果红色=255，点击在立方体上
    picked = true;

  gl.uniform1i(u_Clicked, 0);  // Pass false to u_Clicked(Draw cube with specified color)
                               // 传递false给u_Clicked（绘制指定颜色的立方体）
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

  return picked;
}

var g_MvpMatrix = new Matrix4(); // Model view projection matrix
                                 // 模型视图投影矩阵
function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {
  // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  // 计算模型视图投影矩阵并传递给u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately // 适当旋转
  g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
  g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers (color and depth) // 清除颜色和深度缓冲区
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw // 绘制
}

function draw2D(ctx, currentAngle) {
  ctx.clearRect(0, 0, 400, 400); // Clear <hud> // 清除<hud>
  // Draw triangle with white lines
  // 绘制白色线条的三角形
  ctx.beginPath();                      // Start drawing // 开始绘制
  ctx.moveTo(120, 10); ctx.lineTo(200, 150); ctx.lineTo(40, 150);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Set white to color of lines // 设置白色为线条颜色
  ctx.stroke();                           // Draw Triangle with white lines // 绘制白色线条的三角形
  // Draw white letters // 绘制白色文字
  ctx.font = '18px "Times New Roman"';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters // 设置白色为文字颜色
  ctx.fillText('HUD: Head Up Display', 40, 180); 
  ctx.fillText('Triangle is drawn by Canvas 2D API.', 40, 200); 
  ctx.fillText('Cube is drawn by WebGL API.', 40, 220); 
  ctx.fillText('Current Angle: '+ Math.floor(currentAngle), 40, 240); 
}

var last = Date.now(); // Last time that this function was called // 上次调用此函数的时间
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time // 计算已用时间
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  // 更新当前旋转角度（根据已用时间调整）
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

function initArrayBuffer (gl, data, num, type, attribute) {
  // Create a buffer object
  // 创建一个缓冲区对象
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  // 将数据写入缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  // 将缓冲区对象分配给属性变量
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  // 启用缓冲区对象到属性变量的分配
  gl.enableVertexAttribArray(a_attribute);
  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
