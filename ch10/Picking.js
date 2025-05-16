// Picking.js
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute float a_Face;\n' +   // Surface number (Cannot use int for attribute variable)
                                  // 面数（不能使用int作为属性变量）
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform int u_PickedFace;\n' + // Surface number of selected face
                                  // 选定面的面数
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  int face = int(a_Face);\n' + // Convert to int // 转换为 int
  '  vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;\n' +
  '  if(u_PickedFace == 0) {\n' + // if 0, set face number to v_Color // 如果是0，设置面序号为 v_Color
  '    v_Color = vec4(color, a_Face/255.0);\n' +
  '  } else {\n' +
  '    v_Color = vec4(color, a_Color.a);\n' +
  '  }\n' +
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

var ANGLE_STEP = 20.0; // Rotation angle (degrees/second) // 旋转角度（度/秒）
var g_currentAngle = 0.0; // Current rotation angle // 当前旋转角度

function main() {
  // Retrieve <canvas> element
  // 检索<canvas>元素
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
  var u_PickedFace = gl.getUniformLocation(gl.program, 'u_PickedFace');
  if (!u_MvpMatrix || !u_PickedFace) { 
    console.log('Failed to get the storage location of uniform variable');
    return;
  }

  // Calculate the view projection matrix
  // 计算视图投影矩阵
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Initialize selected 
  // 初始化选定
  gl.uniform1i(u_PickedFace, -1);

  // Register the event handler
  // 注册事件处理程序
  canvas.onmousedown = function(ev) {   // Mouse is pressed // 鼠标按下
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If Clicked position is inside the <canvas>, update the selected surface
      // 如果点击位置在<canvas>内，更新选定面
      updatePickedFace(gl, n, x - rect.left, rect.bottom - y, u_PickedFace, viewProjMatrix, u_MvpMatrix);
    }
  }

  var tick = function() {   // Start drawing // 开始绘制
    g_currentAngle = animate(g_currentAngle);
    draw(gl, n, g_currentAngle, viewProjMatrix, u_MvpMatrix);
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
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v0-v5-v6-v1 up
    0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v1-v6-v7-v2 left
    0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  var faces = new Uint8Array([   // Faces
    1, 1, 1, 1,     // v0-v1-v2-v3 front
    2, 2, 2, 2,     // v0-v3-v4-v5 right
    3, 3, 3, 3,     // v0-v5-v6-v1 up
    4, 4, 4, 4,     // v1-v6-v7-v2 left
    5, 5, 5, 5,     // v7-v4-v3-v2 down
    6, 6, 6, 6,     // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  // 顶点索引
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Create a buffer object
  // 创建缓冲区对象
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }

  // Write vertex information to buffer object
  // 写入顶点信息到缓冲区对象
  if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1; // Coordinate Information // 坐标信息
  if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;      // Color Information // 颜色信息
  if (!initArrayBuffer(gl, faces, gl.UNSIGNED_BYTE, 1, 'a_Face')) return -1;// Surface Information // 面信息

  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  // 写入索引到缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function updatePickedFace(gl, n, x, y, u_PickedFace, viewProjMatrix, u_MvpMatrix) {
  var pixels = new Uint8Array(4); // Array for storing the pixel value // 用于存储像素值的数组
  gl.uniform1i(u_PickedFace, 0);  // Draw by writing surface number into alpha value
                                  // 通过将面序号写入alpha值来绘制
  draw(gl, n, g_currentAngle, viewProjMatrix, u_MvpMatrix);
  // Read the pixel value of the clicked position. pixels[3] is the surface number
  // 读取点击位置的像素值。pixels[3]是面序号
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.uniform1i(u_PickedFace, pixels[3]); // Pass the surface number to u_PickedFace
                                         // 将面序号传递给u_PickedFace
}

var g_MvpMatrix = new Matrix4(); // Model view projection matrix // 模型视图投影矩阵
function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {
  // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  // 计算模型视图投影矩阵并传递给u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately // 适当旋转
  g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
  g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers // 清除缓冲区
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw // 绘制
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

function initArrayBuffer (gl, data, type, num, attribute) {
  // Create a buffer object
  // 创建缓冲区对象
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  // 写入数据到缓冲区对象
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
  // Enable the assignment to a_attribute variable
  // 启用对a_attribute变量的赋值
  gl.enableVertexAttribArray(a_attribute);

  return true;
}
