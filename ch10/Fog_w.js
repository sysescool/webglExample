// Fog_w.js (c) 2012 matsuda and ohnishi
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying float v_Dist;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
     // Use the negative z value of each vertex in view coordinate system
     // 使用视图坐标系中每个顶点的负z值
  '  v_Dist = gl_Position.w;\n' +
  '}\n';

// Fragment shader program
// 片元着色器
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_FogColor;\n' + // Color of Fog // 雾的颜色
  'uniform vec2 u_FogDist;\n' +  // Distance of Fog (starting point, end point) // 雾的距离（起始点，结束点）
  'varying vec4 v_Color;\n' +
  'varying float v_Dist;\n' +
  'void main() {\n' +
     // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
     // 计算雾因子（随着距离眼睛越来越远，因子越来越小）
  '  float fogFactor = (u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x);\n' +
     // Stronger fog as it gets further: u_FogColor * (1 - fogFactor) + v_Color * fogFactor
     // 随着距离眼睛越来越远，雾的颜色越浓：u_FogColor * (1 - fogFactor) + v_Color * fogFactor
  '  vec3 color = mix(u_FogColor, vec3(v_Color), clamp(fogFactor, 0.0, 1.0));\n' +
  '  gl_FragColor = vec4(color, v_Color.a);\n' +
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
  if (n < 1) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Color of Fog
  // 雾的颜色
  var fogColor = new Float32Array([0.137, 0.231, 0.423]);
  // Distance of fog [where fog starts, where fog completely covers object]
  // 雾的距离（起始点，结束点）
  var fogDist = new Float32Array([45, 80]);
  // Position of eye point (world coordinates)
  // 眼睛位置（世界坐标）
  var eye = new Float32Array([25, 65, 35]);

  // Get the storage locations of uniform variables
  // 获取uniform变量的存储位置
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_FogColor = gl.getUniformLocation(gl.program, 'u_FogColor');
  var u_FogDist = gl.getUniformLocation(gl.program, 'u_FogDist');
  if (!u_MvpMatrix || !u_FogColor || !u_FogDist) {
    console.log('Failed to get the storage location');
    return;
  }
	
  // Pass fog color, distances, and eye point to uniform variable
  // 将雾的颜色、距离和眼睛位置传递给uniform变量
  gl.uniform3fv(u_FogColor, fogColor); // Colors // 雾的颜色
  gl.uniform2fv(u_FogDist, fogDist);   // Starting point and end point // 雾的距离（起始点，结束点）

  // Set clear color and enable hidden surface removal
  // 设置清除颜色并启用隐藏表面消除
  gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0); // Color of Fog // 雾的颜色
  gl.enable(gl.DEPTH_TEST); // Enable depth testing // 启用深度测试

  // Pass the model matrix to u_ModelMatrix
  // 将模型矩阵传递给u_ModelMatrix
  var modelMatrix = new Matrix4();
  modelMatrix.setScale(10, 10, 10); // Set scale factor to 10 // 设置缩放因子为10

  // Pass the model view projection matrix to u_MvpMatrix
  // 将模型视图投影矩阵传递给u_MvpMatrix
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 10000);
  mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  // 清除颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw // 绘制
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

  var vertices = new Float32Array([   // Vertex coordinates
     1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
     1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
     1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 up
    -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
    -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 down
     1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1     // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Create a buffer object
  // 创建一个缓冲区对象
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex property to buffers (coordinates and normals)
  // 将顶点属性写入缓冲区（坐标和法向量）
  if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1;
  if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;

  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  // 将索引写入缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, data, type, num, attribute) {
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
  // 启用缓冲区对象的分配
  gl.enableVertexAttribArray(a_attribute);

  return true;
}
