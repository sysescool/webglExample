// TranslatedRotatedTriangle.js (c) 2012 matsuda
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

  // Create Matrix4 object for model transformation
  // 创建模型变换的Matrix4对象
  var modelMatrix = new Matrix4();

  // Calculate a model matrix
  // 计算模型变换矩阵
  var ANGLE = 60.0; // The rotation angle
                    // 旋转角度
  var Tx = 0.5;     // Translation distance
                    // 平移距离
  modelMatrix.setTranslate(Tx, 0, 0);  // Set translation matrix
                                       // 设置平移矩阵
  modelMatrix.rotate(ANGLE, 0, 0, 1);  // Multiply modelMatrix by the calculated rotation matrix
                                       // 将模型变换矩阵乘以计算出的旋转矩阵

  // Pass the model matrix to the vertex shader
  // 将模型变换矩阵传递给顶点着色器
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Specify the color for clearing <canvas>
  // 指定清除<canvas>的颜色
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  // 清除<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  // 绘制矩形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.6,   0.0, 0.0,   0.3, 0.0
  ]);
  var n = 3; // The number of vertices
             // 顶点数量
  // Create a buffer object
  // 创建缓冲区对象
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  // 将数据写入缓冲区对象
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  // 将缓冲区对象绑定到a_Position变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  // 启用a_Position变量
  gl.enableVertexAttribArray(a_Position);

  return n;
}
