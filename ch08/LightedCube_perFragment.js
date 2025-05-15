// LightedCube_perFragment.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_mvpMatrix;\n' +
  'uniform mat4 u_normalMatrix;\n' +
  'uniform vec3 u_LightDir;\n' +
  'varying vec4 v_Color;\n' +
  'varying float v_Dot;\n' +
  'void main() {\n' +
  '  gl_Position = u_mvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  vec4 normal = u_normalMatrix * a_Normal;\n' +
  '  ///// why this is negative? ///// \n' +
  '  v_Dot = max(-dot(normalize(normal.xyz), u_LightDir), 0.0);\n' +
  '}\n';

// Fragment shader program
// 片段着色器
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'varying float v_Dot;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Color.xyz * v_Dot, v_Color.a);\n' +
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

  // 
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to initialize buffers');
    return;
  }

  // Set the clear color and enable the depth test
  // 设置清除颜色并启用深度测试
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  // 获取uniform变量的存储位置
  var u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix'); 
  var u_normalMatrix = gl.getUniformLocation(gl.program, 'u_normalMatrix');
  var u_LightDir = gl.getUniformLocation(gl.program, 'u_LightDir');
  if(!u_mvpMatrix || !u_normalMatrix || !u_LightDir) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the viewing volume
  // 设置视图体积
  var viewMatrix = new Matrix4();   // View matrix // 视图矩阵
  var mvpMatrix = new Matrix4();    // Model view projection matrix // 模型视图投影矩阵
  var mvMatrix = new Matrix4();     // Model matrix // 模型矩阵
  var normalMatrix = new Matrix4(); // Transformation matrix for normals // 法向量矩阵

  // Calculate the view matrix
  // 计算视图矩阵
  viewMatrix.setLookAt(0, 3, 10, 0, 0, 0, 0, 1, 0);
  mvMatrix.set(viewMatrix).rotate(60, 0, 1, 0); // Rotate 60 degree around the y-axis // 绕y轴旋转60度
  // Calculate the model view projection matrix
  // 计算模型视图投影矩阵
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.multiply(mvMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  // 计算基于模型矩阵的法向量矩阵
  normalMatrix.setInverseOf(mvMatrix);
  normalMatrix.transpose();

  // Pass the model view matrix to u_mvpMatrix
  // 将模型视图矩阵传递给u_mvpMatrix
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);

  // Pass the normal matrix to u_normalMatrix
  // 将法向量矩阵传递给u_normalMatrix
  gl.uniformMatrix4fv(u_normalMatrix, false, normalMatrix.elements);

  // Pass the direction of the diffuse light(world coordinate, normalized)
  // 传递漫反射光的方向（世界坐标，归一化）
  var lightDir = new Vector3([1.0, 1.0, 1.0]);
  lightDir.normalize();     // Normalize // 归一化
  var lightDir_eye = viewMatrix.multiplyVector3(lightDir); // Transform to view coordinate // 转换为视图坐标
  lightDir_eye.normalize(); // Normalize // 归一化
  gl.uniform3fv(u_LightDir, lightDir_eye.elements);

  // Clear color and depth buffer
  // 清除颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the cube
  // 绘制立方体
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
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
  // Coordinates
  var vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
				 ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
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

  // Write the vertex property to buffers (coordinates, colors and normals)
  // 将顶点属性写入缓冲区（坐标、颜色和法向量）
  initArrayBuffer(gl, vertices, 3, 'a_Position');
  initArrayBuffer(gl, colors, 3, 'a_Color');
  initArrayBuffer(gl, normals, 3, 'a_Normal');

  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  // 将索引写入缓冲区对象
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, data, num, attribute) {
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
  gl.vertexAttribPointer(a_attribute, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  // 启用缓冲区对象的分配
  gl.enableVertexAttribArray(a_attribute);

  return true;
}
