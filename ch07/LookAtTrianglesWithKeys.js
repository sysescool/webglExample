// LookAtTrianglesWithKeys.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ViewMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
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
  // 获取 <canvas> 元素
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // 获取 WebGL 的渲染上下文
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

  // Set the vertex coordinates and color (the blue triangle is in the front)
  // 设置顶点坐标和颜色（蓝色三角形在前）
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  // 设置清除 <canvas> 的颜色
  gl.clearColor(0, 0, 0, 1);

  // Get the storage location of u_ViewMatrix
  // 获取 u_ViewMatrix 的存储位置
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) { 
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  // Create the view matrix
  // 创建视图矩阵
  var viewMatrix = new Matrix4();
  // Register the event handler to be called on key press
  // 注册事件处理程序，当按下键时调用
  document.onkeydown = function(ev){ keydown(ev, gl, n, u_ViewMatrix, viewMatrix); };

  draw(gl, n, u_ViewMatrix, viewMatrix);   // Draw // 绘制
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    // 顶点坐标和颜色
    0.0, -0.6,  -0.4,     0.4,  1.0,  0.4, // The back green one
    0.3,  0.0,  -0.4,     0.4,  1.0,  0.4, // 后面的绿色三角形
    0.0,  0.0,  -0.4,     1.0,  0.4,  0.4, 
   
    0.0,  0.3,  -0.2,     1.0,  0.4,  0.4, // The middle yellow one
    0.6,  0.0,  -0.2,     1.0,  1.0,  0.4, // 中间的黄色三角形
    0.0,  0.0,  -0.2,     1.0,  1.0,  0.4, 

    0.0,  0.6,   0.0,     0.4,  0.4,  1.0,  // The front blue one 
    0.3,  0.0,   0.0,     0.4,  0.4,  1.0,  // 前面的蓝色三角形
    0.0,  0.0,   0.0,     1.0,  0.4,  0.4, 
  ]);
  var n = 9;

  // Create a buffer object
  // 创建一个缓冲区对象
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex information and enable it
  // 将顶点信息写入缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  // 获取 a_Position 的存储位置, 分配并启用缓冲区
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object
                                           // 启用缓冲区对象的分配
  // Get the storage location of a_Position, assign buffer and enable
  // 获取 a_Position 的存储位置, 分配并启用缓冲区
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Assign the buffer object to a_Color variable
  // 将缓冲区对象分配给 a_Color 变量
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object
                                        // 启用缓冲区对象的分配
  return n;
}

var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25; // Eye position // 眼睛位置
function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    if(ev.keyCode == 39) { // The right arrow key was pressed
      g_eyeX += 0.01;      // 右箭头被按下
    } else 
    if (ev.keyCode == 37) { // The left arrow key was pressed
      g_eyeX -= 0.01;       // 左箭头被按下
    } else { return; }
    draw(gl, n, u_ViewMatrix, viewMatrix);    
}

function draw(gl, n, u_ViewMatrix, viewMatrix) {
  // Set the matrix to be used for to set the camera view
  // 设置用于设置相机视图的矩阵
  viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);

  // Pass the view projection matrix
  // 传递视图投影矩阵
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);     // Clear <canvas>
                                     // 清除 <canvas>
  gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
                                     // 绘制
}
