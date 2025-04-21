// RotatingTranslatedTriangle.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
// 片元着色器
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

// Rotation angle (degrees/second)
// 旋转角度（度/秒）
var ANGLE_STEP = 45.0;

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

  // Write the positions of vertices to a vertex shader
  // 初始化顶点缓冲区
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  // 指定清除<canvas>的颜色
  gl.clearColor(0, 0, 0, 1);

  // Get storage location of u_ModelMatrix
  // 获取u_ModelMatrix的存储位置
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Current rotation angle
  // 当前旋转角度
  var currentAngle = 0.0;
  // Model matrix
  // 模型矩阵
  var modelMatrix = new Matrix4();

  // Start drawing
  // 开始绘制
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array ([
    0, 0.6,   0.0, 0.0,   0.3, 0.0
  ]);
  var n = 3;   // The number of vertices
               // 顶点数量
  // Create a buffer object
  // 创建缓冲区对象
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  // 将数据写入缓冲区对象
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  // 将缓冲区对象绑定到a_Position变量
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  // 启用a_Position变量
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // Set the rotation matrix
  // 设置旋转矩阵
  modelMatrix.setRotate(currentAngle, 0, 0, 1);
  // 平移
  modelMatrix.translate(0.35, 0, 0);
 
  // Pass the rotation matrix to the vertex shader
  // 将旋转矩阵传递给顶点着色器
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas>
  // 清除<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Last time that this function was called
// 上次调用此函数的时间
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  // 计算已用时间
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  // 更新当前旋转角度（根据已用时间调整）
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function up() {
  ANGLE_STEP += 10; 
}

function down() {
  ANGLE_STEP -= 10; 
}
