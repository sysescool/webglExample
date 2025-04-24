// Zfighting.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ViewProjMatrix * a_Position;\n' +
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

  //Set clear color and enable the hidden surface removal function
  // 设置清除颜色并启用隐藏表面消除功能
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of u_ViewProjMatrix
  // 获取 u_ViewProjMatrix 的存储位置
  var u_ViewProjMatrix = gl.getUniformLocation(gl.program, 'u_ViewProjMatrix');
  if (!u_ViewProjMatrix) { 
    console.log('Failed to get the storage locations of u_ViewProjMatrix');
    return;
  }

  var viewProjMatrix = new Matrix4();
  // Set the eye point, look-at point, and up vector.
  // 设置眼睛点，目标点和上向量
  viewProjMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  viewProjMatrix.lookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0);

  // Pass the view projection matrix to u_ViewProjMatrix
  // 传递视图投影矩阵到 u_ViewProjMatrix
  gl.uniformMatrix4fv(u_ViewProjMatrix, false, viewProjMatrix.elements);

  // Clear color and depth buffer
  // 清除颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Enable the polygon offset function
  // 启用多边形偏移功能
  gl.enable(gl.POLYGON_OFFSET_FILL);
  // Draw the triangles
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n/2);   // The green triangle      // 绿色三角形
  // polygonOffset(factor, units)
  // 每个Fragment 的深度值都会增加如下所示的偏移量: Offset = ( m * factor ) + ( r * units)
  // * m: 多边形的深度的斜率的最大值,理解一个多边形越是与近裁剪面平行,m就越接近于0.
  // * r: 能产生于窗口坐标系的深度值中可分辨的差异最小值.r 是由具体是由具体OpenGL 平台指定的一个常量.
    gl.polygonOffset(1.0, 1.0);          // Set the polygon offset  // 设置多边形偏移
  gl.drawArrays(gl.TRIANGLES, n/2, n/2); // The yellow triangle     // 黄色三角形
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    // 顶点坐标和颜色
     0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
    -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4, // 绿色三角形
     2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 

     0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
    -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, // 黄色三角形
     3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
  ]);
  var n = 6;

  // Create a buffer object
  // 创建一个缓冲区对象
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex coordinates and color to the buffer object
  // 写入顶点坐标和颜色到缓冲区对象
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

  return n;
}
