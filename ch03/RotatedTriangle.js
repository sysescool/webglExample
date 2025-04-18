// RotatedTriangle.js (c) 2012 matsuda
// Vertex shader program
// 顶点着色器
var VSHADER_SOURCE =
  // 极坐标系中有以下性质：
  // polar coordinates have the following properties:
  //     1. x = r * cosθ
  //     2. y = r * sinθ
  //     3. r = sqrt(x^2 + y^2)
  // 在极坐标系中，对任意一点 (x, y) 绕圆心 (0, 0) 旋转角度 β，得到新的坐标 (x', y')
  // in polar coordinates, if a point (x, y) is rotated around the origin (0, 0) by an angle β, the new coordinates (x', y') are
  // 则有：
  // given by:
  // x' = r * cos(θ + β) 
  //    = r * cos(θ + β)
  //    = r * (cos θ cos β - sin θ sin β)
  //    = x * cosβ - y * sinβ
  // y' = r * sin(θ + β) * x sinβ + y cosβ  //　Equation 3.3
  //    = r * sin(θ + β)
  //    = r * (sin θ cos β + cos θ sin β)
  //    = x * sinβ + y * cosβ
  // z' = z
  'attribute vec4 a_Position;\n' +
  'uniform float u_CosB, u_SinB;\n' +
  'void main() {\n' +
  '  gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n' +
  '  gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n' +
  '  gl_Position.z = a_Position.z;\n' +
  '  gl_Position.w = 1.0;\n' +
  '}\n';

// Fragment shader program
// 片段着色器
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

// The rotation angle
// 旋转角度
var ANGLE = 90.0; 

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

  // Write the positions of vertices to a vertex shader
  // 将顶点位置写入顶点着色器
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // // Pass the data required to rotate the shape to the vertex shader
  // 将需要旋转的形状所需的数据传递给顶点着色器
  var radian = Math.PI * ANGLE / 180.0; // Convert to radians
                                        // 角度转换为弧度
  var cosB = Math.cos(radian);
  var sinB = Math.sin(radian);

  var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
  var u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
  if (!u_CosB || !u_SinB) {
    console.log('Failed to get the storage location of u_CosB or u_SinB');
    return;
  }
  gl.uniform1f(u_CosB, cosB);
  gl.uniform1f(u_SinB, sinB);

  // Specify the color for clearing <canvas>
  // 指定清除 <canvas> 的颜色
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  // 清除 <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices
             // 顶点数量
  // Create a buffer object
  // 创建缓冲区对象
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
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
  // 将缓冲区对象分配给 a_Position 变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  // 启用 a_Position 变量的赋值
  gl.enableVertexAttribArray(a_Position);

  return n;
}
