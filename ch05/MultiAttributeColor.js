// MultiAttributeColor.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' + // varying variable
                              // 可变变量
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +  // Pass the data to the fragment shader
                              // 传递数据到片元着色器
  '}\n';

// Fragment shader program
// 片元着色器
var FSHADER_SOURCE =
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#avoid_ifdef_gl_es
  // '#ifdef GL_ES\n' +
  'precision mediump float;\n' + // Precision qualifier (See Chapter 6)
                                 // 精度限定符（见第6章）
  // '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +    // Receive the data from the vertex shader
                                 // 接收顶点着色器传递的数据
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

  // 
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  // 设置清除 <canvas> 的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // 清除 <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw three points
  // 绘制三个点
  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    // 顶点坐标 和      颜色
     0.0,  0.5,  1.0,  0.0,  0.0, 
    -0.5, -0.5,  0.0,  1.0,  0.0, 
     0.5, -0.5,  0.0,  0.0,  1.0, 
  ]);
  var n = 3; // The number of vertices
             // 顶点数量
  // Create a buffer object
  // 创建一个缓冲区对象
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Write the vertex coordinates and colors to the buffer object
  // 将顶点坐标和颜色写入缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  // 获取 a_Position 的存储位置，并启用缓冲区
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object
                                           // 启用缓冲区分配
  // Get the storage location of a_Position, assign buffer and enable
  // 获取 a_Position 的存储位置，并启用缓冲区
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object
                                        // 启用缓冲区分配
  return n;
}
