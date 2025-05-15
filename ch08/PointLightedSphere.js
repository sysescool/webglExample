// PointLightedCube.js (c) 2012 matsuda and kanda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
   //  'attribute vec4 a_Color;\n' + // Defined constant in main()
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix // 模型矩阵
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal // 法向量矩阵
  'uniform vec3 u_LightColor;\n' +     // Light color // 光源颜色
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source // 光源位置
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);\n' + // Sphere color // 球体颜色
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
     // 计算一个法向量，使其与模型矩阵相匹配，并使其长度为1.0
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
     // 计算顶点的世界坐标
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
     // Calculate the light direction and make it 1.0 in length
     // 计算光源方向，并使其长度为1.0
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
     // The dot product of the light direction and the normal
     // 计算光源方向和法向量的点积
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
     // 计算漫反射颜色
  '  vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
     // 计算环境反射颜色
  '  vec3 ambient = u_AmbientLight * color.rgb;\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
     // 将漫反射颜色和环境反射颜色相加
  '  v_Color = vec4(diffuse + ambient, color.a);\n' + 
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

  // Set the vertex coordinates, the color and the normal
  // 设置顶点坐标，颜色和法向量
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  // 设置清除颜色并启用深度测试
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  // 获取uniform变量的存储位置
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  // 设置光源颜色（白色）
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  // 设置光源方向（在世界坐标系中）
  gl.uniform3f(u_LightPosition, 5.0, 8.0, 7.0);
  // Set the ambient light
  // 设置环境光
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  var modelMatrix = new Matrix4();  // Model matrix // 模型矩阵
  var mvpMatrix = new Matrix4(); 　 // Model view projection matrix
                                    // 模型视图投影矩阵
  var normalMatrix = new Matrix4(); // Transformation matrix for normals
                                    // 法向量矩阵

  // Pass the model matrix to u_ModelMatrix
  // 将模型矩阵传递给u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Calculate the view projection matrix
  // 计算视图投影矩阵
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Pass the model view projection matrix to u_MvpMatrix
  // 将模型视图投影矩阵传递给u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Calculate the matrix to transform the normal based on the model matrix
  // 计算基于模型矩阵的法向量矩阵
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  // 将法向量矩阵传递给u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  // Clear color and depth buffer
  // 清除颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
  // 绘制立方体（注意第三个参数是gl.UNSIGNED_SHORT）
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function initVertexBuffers(gl) { // Create a sphere // 创建一个球体
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var indices = [];

  // Generate coordinates
  // 生成坐标
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  // Write the vertex property to buffers (coordinates and normals)
  // 将顶点属性写入缓冲区（坐标和法向量）
  // Same data can be used for vertex and normal
  // 相同的坐标数据可以用于顶点和法向量
  // In order to make it intelligible, another buffer is prepared separately
  // 为了使其易于理解，另一个缓冲区被单独准备
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  // 将索引写入缓冲区对象
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
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

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
