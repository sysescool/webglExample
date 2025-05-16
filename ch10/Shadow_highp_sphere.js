// Shadow_highp.js (c) 2012 matsuda and tanaka
// Vertex shader program for generating a shadow map
// 顶点着色器，用于生成阴影贴图
var SHADOW_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program for generating a shadow map
// 片段着色器，用于生成阴影贴图
var SHADOW_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'void main() {\n' +
  '  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\n' +
  '  const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\n' +
  '  vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);\n' + // Calculate the value stored into each byte
                                                             // 计算每个字节存储的值
  '  rgbaDepth -= rgbaDepth.gbaa * bitMask;\n' + // Cut off the value which do not fit in 8 bits
                                                 // 截断不适合8位的值
  '  gl_FragColor = rgbaDepth;\n' +
  '}\n';

// Vertex shader program for regular drawing
// 顶点着色器，用于常规绘制
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_MvpMatrixFromLight;\n' +
  'varying vec4 v_PositionFromLight;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' + 
  '  v_PositionFromLight = u_MvpMatrixFromLight * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program for regular drawing
// 片段着色器，用于常规绘制
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  'uniform sampler2D u_ShadowMap;\n' +
  'varying vec4 v_PositionFromLight;\n' +
  'varying vec4 v_Color;\n' +
  // Recalculate the z value from the rgba
  // 从rgba值重新计算z值
  'float unpackDepth(const in vec4 rgbaDepth) {\n' +
  '  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));\n' +
  '  float depth = dot(rgbaDepth, bitShift);\n' + // Use dot() since the calculations is same
                                                  // 使用dot()，因为计算相同
  '  return depth;\n' +
  '}\n' +
  'void main() {\n' +
  '  vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;\n' +
  '  vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);\n' +
  '  float depth = unpackDepth(rgbaDepth);\n' + // Recalculate the z value from the rgba
                                                // 从rgba值重新计算z值
  '  float visibility = (shadowCoord.z > depth + 0.0015) ? 0.7 : 1.0;\n' +
  '  gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);\n' +
  '}\n';

var OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;
var LIGHT = [0, 7, 2]; // Light position(x, y, z) // 光源位置(x, y, z)

function main() {
  // Retrieve <canvas> element
  // 检索<canvas>元素
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // 获取WebGL的渲染上下文
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders for generating a shadow map
  // 初始化用于生成阴影贴图的着色器
  var shadowProgram = createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE);
  shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, 'a_Position');
  shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix');
  if (shadowProgram.a_Position < 0 || !shadowProgram.u_MvpMatrix) {
    console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram'); 
    return;
  }

  // Initialize shaders for regular drawing
  // 初始化用于常规绘制的着色器
  var normalProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  normalProgram.a_Position = gl.getAttribLocation(normalProgram, 'a_Position');
  normalProgram.a_Color = gl.getAttribLocation(normalProgram, 'a_Color');
  normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');
  normalProgram.u_MvpMatrixFromLight = gl.getUniformLocation(normalProgram, 'u_MvpMatrixFromLight');
  normalProgram.u_ShadowMap = gl.getUniformLocation(normalProgram, 'u_ShadowMap');
  if (normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || !normalProgram.u_MvpMatrix ||
      !normalProgram.u_MvpMatrixFromLight || !normalProgram.u_ShadowMap) {
    console.log('Failed to get the storage location of attribute or uniform variable from normalProgram'); 
    return;
  }

  // Set the vertex information
  // 设置顶点信息
  var triangle = initVertexBuffersForTriangle(gl);
  var sphere = initVertexBuffersForSphere(gl);
  if (!triangle || !sphere) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Initialize framebuffer object (FBO)  
  // 初始化帧缓冲区对象(FBO)
  var fbo = initFramebufferObject(gl);
  if (!fbo) {
    console.log('Failed to initialize framebuffer object');
    return;
  }
  gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
                                 // 设置一个纹理对象到纹理单元
  gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

  // Set the clear color and enable the depth test
  // 设置清除颜色并启用深度测试
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  var viewProjMatrixFromLight = new Matrix4(); // Prepare a view projection matrix for generating a shadow map
                                               // 准备一个用于生成阴影贴图的视图投影矩阵
  viewProjMatrixFromLight.setPerspective(70.0, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1.0, 200.0);
  viewProjMatrixFromLight.lookAt(LIGHT[0], LIGHT[1], LIGHT[2], 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var viewProjMatrix = new Matrix4();          // Prepare a view projection matrix for regular drawing
                                               // 准备一个用于常规绘制的视图投影矩阵
  viewProjMatrix.setPerspective(45, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 7.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var currentAngle = 0.0; // Current rotation angle (degrees) // 当前旋转角度(度)
  var mvpMatrixFromLight_t = new Matrix4(); // A model view projection matrix from light source (for triangle)
                                            // 从光源的模型视图投影矩阵(用于三角形)
  var mvpMatrixFromLight_p = new Matrix4(); // A model view projection matrix from light source (for plane)
                                            // 从光源的模型视图投影矩阵(用于平面)
  var tick = function() {
    currentAngle = animate(currentAngle);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);               // Change the drawing destination to FBO
                                                           // 将绘制目标更改为FBO
    gl.viewport(0, 0, OFFSCREEN_HEIGHT, OFFSCREEN_HEIGHT); // Set view port for FBO // 设置FBO的视口
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear FBO // 清除FBO

    gl.useProgram(shadowProgram); // Set shaders for generating a shadow map
                                  // 设置用于生成阴影贴图的着色器
    // Draw the triangle and the plane (for generating a shadow map)
    // 绘制三角形和平面(用于生成阴影贴图)
    drawTriangle(gl, shadowProgram, triangle, currentAngle, viewProjMatrixFromLight);
    mvpMatrixFromLight_t.set(g_mvpMatrix); // Used later // 稍后使用
    drawSphere(gl, shadowProgram, sphere, viewProjMatrixFromLight);
    mvpMatrixFromLight_p.set(g_mvpMatrix); // Used later // 稍后使用

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);               // Change the drawing destination to color buffer
                                                            // 将绘制目标更改为颜色缓冲区
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
                                                            // 清除颜色和深度缓冲区

    gl.useProgram(normalProgram); // Set the shader for regular drawing
                                  // 设置用于常规绘制的着色器
    gl.uniform1i(normalProgram.u_ShadowMap, 0);  // Pass 0 because gl.TEXTURE0 is enabled
                                                 // 传递0，因为gl.TEXTURE0已启用
    // Draw the triangle and plane ( for regular drawing)
    // 绘制三角形和平面(用于常规绘制)
    gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_t.elements);
    drawTriangle(gl, normalProgram, triangle, currentAngle, viewProjMatrix);
    gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_p.elements);
    drawSphere(gl, normalProgram, sphere, viewProjMatrix);

    window.requestAnimationFrame(tick, canvas);
  };
  tick(); 
}

// Coordinate transformation matrix
// 坐标变换矩阵
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
function drawTriangle(gl, program, triangle, angle, viewProjMatrix) {
  // Set rotate angle to model matrix and draw triangle
  // 设置旋转角度到模型矩阵并绘制三角形
  g_modelMatrix.setRotate(angle, 0, 1, 0);
  draw(gl, program, triangle, viewProjMatrix);
}

function drawSphere(gl, program, sphere, viewProjMatrix) {
  // Set scaling and translation to model matrix and draw sphere
  // 设置缩放和平移到模型矩阵并绘制球体
  g_modelMatrix.setScale(3.0, 3.0, 3.0);
  g_modelMatrix.translate(0.0, -0.7, 0.0);
  draw(gl, program, sphere, viewProjMatrix);
}

function draw(gl, program, o, viewProjMatrix) {
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
  if (program.a_Color != undefined) // If a_Color is defined to attribute
                                    // 如果a_Color被定义为属性
    initAttributeVariable(gl, program.a_Color, o.colorBuffer);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

  // Calculate the model view project matrix and pass it to u_MvpMatrix
  // 计算模型视图投影矩阵并传递给u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0);
}

// Assign the buffer objects and enable the assignment
// 分配缓冲区对象并启用分配
function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initVertexBuffersForSphere(gl) { // Create a sphere // 创建一个球体
  var SPHERE_DIV = 20;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var vertices = [];
  var indices = [];

  // Generate coordinates // 生成坐标
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      vertices.push(si * sj);  // X
      vertices.push(cj);       // Y
      vertices.push(ci * sj);  // Z
    }
  }

  // Generate indices // 生成索引
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

  var o = new Object(); // Utilize Object object to return multiple buffer objects together
                        // 利用Object对象返回多个缓冲区对象
  // Write vertex information to buffer object
  // 写入顶点信息到缓冲区对象
  o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, new Uint8Array(indices), gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForTriangle(gl) {
  // Create a triangle // 创建一个三角形
  //       v2
  //      / | 
  //     /  |
  //    /   |
  //  v0----v1

  // Vertex coordinates // 顶点坐标
  var vertices = new Float32Array([-0.8, 3.5, 0.0,  0.8, 3.5, 0.0,  0.0, 3.5, 1.8]);
  // Colors // 颜色
  var colors = new Float32Array([1.0, 0.5, 0.0,  1.0, 0.5, 0.0,  1.0, 0.0, 0.0]);    
  // Indices of the vertices // 顶点索引
  var indices = new Uint8Array([0, 1, 2]);

  var o = new Object();  // Utilize Object object to return multiple buffer objects together
                         // 利用Object对象返回多个缓冲区对象

  // Write vertex information to buffer object
  // 写入顶点信息到缓冲区对象
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  // 解绑缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  // Create a buffer object
  // 创建一个缓冲区对象
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  // 写入数据到缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  // 存储必要信息以稍后将对象分配给属性变量
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  // Create a buffer object
  // 创建一个缓冲区对象
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  // 写入数据到缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

function initFramebufferObject(gl) {
  var framebuffer, texture, depthBuffer;

  // Define the error handling function
  // 定义错误处理函数
  var error = function() {
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    if (texture) gl.deleteTexture(texture);
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
    return null;
  }

  // Create a frame buffer object (FBO)
  // 创建一个帧缓冲区对象(FBO)
  framebuffer = gl.createFramebuffer();
  if (!framebuffer) {
    console.log('Failed to create frame buffer object');
    return error();
  }

  // Create a texture object and set its size and parameters
  // 创建一个纹理对象并设置其大小和参数
  texture = gl.createTexture(); // Create a texture object // 创建一个纹理对象
  if (!texture) {
    console.log('Failed to create texture object');
    return error();
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Create a renderbuffer object and Set its size and parameters
  // 创建一个渲染缓冲区对象并设置其大小和参数
  depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object // 创建一个渲染缓冲区对象
  if (!depthBuffer) {
    console.log('Failed to create renderbuffer object');
    return error();
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

  // Attach the texture and the renderbuffer object to the FBO
  // 将纹理和渲染缓冲区对象附加到FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  // Check if FBO is configured correctly
  // 检查 FBO 是否配置正确
  var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('Frame buffer object is incomplete: ' + e.toString());
    return error();
  }

  framebuffer.texture = texture; // keep the required object // 保持所需的物体

  // Unbind the buffer object // 解绑缓冲区对象
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return framebuffer;
}

var ANGLE_STEP = 40;   // The increments of rotation angle (degrees) // 旋转角度的增量(度)

var last = Date.now(); // Last time that this function was called // 上次调用此函数的时间 
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time // 计算已用时间
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time) // 更新当前旋转角度(根据已用时间调整) 
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}
