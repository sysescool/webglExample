// RoundedPoints.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
// 片元着色器
var FSHADER_SOURCE =
  // '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  // '#endif GL_ES\n' +
  'void main() {\n' +    // Center coordinate is (0.5, 0.5) // 中心坐标是(0.5, 0.5)
  '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' +
  '  if(d < 0.5) {\n' +  // Radius is 0.5 // 半径是0.5
  '    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '  } else { discard; }\n' +
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

  // Set the vertex information
  // 设置顶点信息
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  // 指定清除<canvas>的颜色
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  // 清除<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw three points
  // 绘制三个点
  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices // 顶点数

  // Create a buffer object
  // 创建一个缓冲区对象
  var vertexBuffer = gl.createBuffer();  
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the vertex buffer
  // 绑定顶点缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  // 将数据写入缓冲区对象
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  // 将缓冲区对象分配给属性变量
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Unbind the buffer object
  // 取消绑定缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
 
  // Enable the assignment to a_Position variable
  // 启用a_Position变量
  gl.enableVertexAttribArray(a_Position);

  return n;
}
