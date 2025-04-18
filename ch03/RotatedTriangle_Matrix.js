// RotatedTriangle_Matrix.js (c) matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  // 根据 03.09-RotatedTriangle.js 中的推导，
  // according to the derivation in 03.09-RotatedTriangle.js,
  //     x' = x * cosβ - y * sinβ
  //     y' = x * sinβ + y * cosβ
  //     z' = z
  // 行主序 旋转矩阵为：
  // row-major order rotation matrix is:
  //     | cosβ, -sinβ, 0.0, 0.0 |   | x |   | x' |
  //     | sinβ,  cosβ, 0.0, 0.0 | x | y | = | y' |
  //     |  0.0,  0.0,  1.0, 0.0 |   | z |   | z' |
  //     |  0.0,  0.0,  0.0, 1.0 |   | 1 |   | 1  |
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
// 片元着色器
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

// The rotation angle
// 旋转角度
var ANGLE = 90.0;

function main() {
  // Retrieve <canvas> element
  // 获取 canvas 元素
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
 
  // Write the positions of vertices to a vertex shader
  // 写入顶点位置
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Create a rotation matrix
  // 创建一个旋转矩阵
  var radian = Math.PI * ANGLE / 180.0; // Convert to radians
  var cosB = Math.cos(radian), sinB = Math.sin(radian);

  // Note: WebGL is column major order
  // WebGL 是列主序
  var xformMatrix = new Float32Array([
     cosB, sinB, 0.0, 0.0,
    -sinB, cosB, 0.0, 0.0,
      0.0,  0.0, 1.0, 0.0,
      0.0,  0.0, 0.0, 1.0
  ]);

  // Pass the rotation matrix to the vertex shader
  // 将旋转矩阵传递给顶点着色器
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

  // Specify the color for clearing <canvas>
  // 指定清除 canvas 的颜色
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  // 清除 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices
             // 顶点数量
  
  // Create a buffer object
  // 创建一个缓冲区对象
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  // 写入数据到缓冲区对象
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  // 将缓冲区对象赋值给 a_Position 变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  // 启用 a_Position 变量
  gl.enableVertexAttribArray(a_Position);

  return n;
}

