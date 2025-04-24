// LookAtTriangles.js (c) 2012 matsuda
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
  if (!u_ViewMatrix) { 
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  // 设置用于设置相机视图的矩阵
  var viewMatrix = new Matrix4();
  // eye-pos:(0.20, 0.25, 0.25）
  // watch-point-pos:(0, 0, 0)
  // camera-up:(0, 1, 0)
  viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
  // 行优先：viewMatrix:
  // |  0.780,     0, -0.625,      0, |
  // | -0.384, 0.788, -0.481,  5.960, |
  // |  0.492, 0.615,  0.615, -0.406, |
  // |      0,     0,      0,      1  |

  // Set the view matrix
  // 将矩阵传递给 u_ViewMatrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Clear <canvas>
  // 清除 <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    2.0, 0.05,  0.0,     1.0,  0.0,  0.0,  // x axis
    2.0, 0.0,   0.0,     1.0,  0.0,  0.0,
   -2.0, 0.0,   0.0,     1.0,  0.0,  0.0,

    0.05,  2.0,  0.0,     0.0,  1.0,  0.0,  // y axis
    0.0,   2.0,  0.0,     0.0,  1.0,  0.0,
    0.0,  -1.0,  0.0,     0.0,  1.0,  0.0,

    0.0,   0.05, 2.0,     0.0,  0.0,  1.0,  // z axis
    0.0,   0.0,  2.0,     0.0,  0.0,  1.0,
    0.0,   0.0, -1.0,     0.0,  0.0,  1.0,

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
  var n = 9;  // only triangle      // 只绘制三角形
  n = 18;     // tirangle with axis // 绘制三角形和轴

  // Create a buffer object
  // 创建一个缓冲区对象
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex coordinates and color to the buffer object
  // 将顶点坐标和颜色写入缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  // 将缓冲区对象分配给 a_Position 并启用分配
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  // Assign the buffer object to a_Color and enable the assignment
  // 将缓冲区对象分配给 a_Color 并启用分配
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
