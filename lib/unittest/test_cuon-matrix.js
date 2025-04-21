// test_cuon-matrix.js
// 单元测试文件，用于测试 cuon-matrix.js 中的 Matrix4 和 Vector3/Vector4 类

// 测试 Matrix4 构造函数
function testMatrix4Constructor() {
  console.log("测试 Matrix4 构造函数...");
  
  // 测试默认构造函数（单位矩阵）
  var m1 = new Matrix4();
  var expected = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  var result = true;
  
  for (var i = 0; i < 16; i++) {
    if (Math.abs(m1.elements[i] - expected[i]) > 0.0001) {
      result = false;
      break;
    }
  }
  
  console.log("  默认构造函数测试: " + (result ? "通过" : "失败"));
  
  // 测试带参数的构造函数
  var m2 = new Matrix4();
  m2.elements[0] = 2;
  var m3 = new Matrix4(m2);
  result = (Math.abs(m3.elements[0] - 2) < 0.0001);
  
  console.log("  带参数构造函数测试: " + (result ? "通过" : "失败"));
}

// 测试 setIdentity (设置单位矩阵) 方法
function testSetIdentity() {
  console.log("测试 setIdentity(设置单位矩阵) 方法...");
  
  var m = new Matrix4();
  m.elements[0] = 2; // 修改一个元素
  
  m.setIdentity();
  
  var expected = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  var result = true;
  
  for (var i = 0; i < 16; i++) {
    if (Math.abs(m.elements[i] - expected[i]) > 0.0001) {
      result = false;
      break;
    }
  }
  
  console.log("  setIdentity(设置单位矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 set(设置矩阵) 方法
function testSet() {
  console.log("测试 set(设置矩阵) 方法...");
  
  var m1 = new Matrix4();
  m1.elements[0] = 2;
  
  var m2 = new Matrix4();
  m2.set(m1);
  
  var result = (Math.abs(m2.elements[0] - 2) < 0.0001);
  
  console.log("  set(设置矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 concat(右乘矩阵) 方法
function testConcat() {
  console.log("测试 concat(右乘矩阵) 方法...");
  
  var m1 = new Matrix4();
  m1.setScale(2, 2, 2);
  
  var m2 = new Matrix4();
  m2.setTranslate(1, 1, 1);
  
  m1.concat(m2);
  // 正确的顺序是： Translate * Rotate * Scale * v
  //     即 T.concat(R).concat(S).concat(v)
  // 但这里的结果应该是先平移后缩放
  var expected = [2, 0, 0, 0,
                  0, 2, 0, 0,
                  0, 0, 2, 0,
                  2, 2, 2, 1];
  var result = true;
  for( var i = 0; i < 16; i++){
    if(Math.abs(m1.elements[i] - expected[i]) > 0.0001){
      result = false;
      break;
    }
  }
  
  console.log("  concat(右乘矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 multiplyVector3(仿射变换缩放，旋转，平移三维向量) 方法
function testMultiplyVector3() {
  console.log("测试 multiplyVector3(仿射变换缩放，旋转，平移三维向量) 方法...");
  
  var m = new Matrix4();
  m.setTranslate(1, 2, 3);
  
  var v = new Vector3();
  v.elements = [0, 0, 0];
  
  var result = m.multiplyVector3(v);
  
  var expected = [1, 2, 3];
  var testResult = true;
  
  for (var i = 0; i < 3; i++) {
    if (Math.abs(result.elements[i] - expected[i]) > 0.0001) {
      testResult = false;
      break;
    }
  }
  
  console.log("  multiplyVector3(仿射变换缩放，旋转，平移三维向量) 测试: " + (testResult ? "通过" : "失败"));
}

// 测试 multiplyVector4(变换四维向量，没有处理 w 齐次分量) 方法
function testMultiplyVector4() {
  console.log("测试 multiplyVector4(变换四维向量，没有处理 w 齐次分量) 方法...");
  
  var m = new Matrix4();
  m.setTranslate(1, 2, 3);
  
  var v = new Vector4();
  v.elements = [0, 0, 0, 1];
  
  var result = m.multiplyVector4(v);
  
  var expected = [1, 2, 3, 1];
  var testResult = true;
  
  for (var i = 0; i < 4; i++) {
    if (Math.abs(result.elements[i] - expected[i]) > 0.0001) {
      testResult = false;
      break;
    }
  }
  
  console.log("  multiplyVector4(变换四维向量，没有处理 w 齐次分量) 测试: " + (testResult ? "通过" : "失败"));
}

// 测试 transpose(转置矩阵) 方法
function testTranspose() {
  console.log("测试 transpose(转置矩阵) 方法...");
  
  var m = new Matrix4();
  m.elements = [1,2,3,4, 5,6,7,8, 9,10,11,12, 13,14,15,16];
  
  m.transpose();
  
  var expected = [1,5,9,13, 2,6,10,14, 3,7,11,15, 4,8,12,16];
  var result = true;
  
  for (var i = 0; i < 16; i++) {
    if (Math.abs(m.elements[i] - expected[i]) > 0.0001) {
      result = false;
      break;
    }
  }
  
  console.log("  transpose(转置矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setInverseOf(设置逆矩阵) 方法
function testSetInverseOf() {
  console.log("测试 setInverseOf(设置逆矩阵) 方法...");
  
  var m1 = new Matrix4();
  m1.setScale(2, 2, 2);
  
  // 求 m1 的逆矩阵并设置为 m2
  var m2 = new Matrix4();
  m2.setInverseOf(m1);
  
  // 2x2x2 矩阵的逆矩阵应该是 0.5x0.5x0.5
  var expected = [0.5,0,0,0, 0,0.5,0,0, 0,0,0.5,0, 0,0,0,1];
  var result = true;
  for(var i = 0; i < 16; i++){
    if(Math.abs(m2.elements[i] - expected[i]) > 0.0001){
      result = false;
      break;
    }
  }
  
  console.log("  setInverseOf(设置逆矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 invert(求逆矩阵) 方法
function testInvert() {
  console.log("测试 invert(求逆矩阵) 方法...");
  
  var m = new Matrix4();
  m.setScale(2, 2, 2);
  
  m.invert();
  
  var expected = [0.5,0,0,0, 0,0.5,0,0, 0,0,0.5,0, 0,0,0,1];
  var result = true;
  for(var i = 0; i < 16; i++){
    if(Math.abs(m.elements[i] - expected[i]) > 0.0001){
      result = false;
      break;
    }
  }
  console.log("  invert(求逆矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setOrtho(设置正交投影矩阵) 方法
function testSetOrtho() {
  console.log("测试 setOrtho(设置正交投影矩阵) 方法...");
  
  var m = new Matrix4();
  // left, right, bottom, top, near, far
  m.setOrtho(-1, 1, -1, 1, -1, 1);
  
  // 正交投影矩阵的特定元素应该有特定值
  var result = (Math.abs(m.elements[0] - 1) < 0.0001 && 
                Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[10] - (-1)) < 0.0001 &&
                Math.abs(m.elements[15] - 1) < 0.0001);
  
  console.log("  setOrtho(设置正交投影矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 ortho(右乘正交投影矩阵) 方法
function testOrtho() {
  console.log("测试 ortho(右乘正交投影矩阵) 方法...");
  
  var m = new Matrix4();
  // left, right, bottom, top, near, far
  m.ortho(-1, 1, -1, 1, -1, 1);
  
  var result = (Math.abs(m.elements[0] - 1) < 0.0001 && 
                Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[10] - (-1)) < 0.0001 &&
                Math.abs(m.elements[15] - 1) < 0.0001);
  
  console.log("  ortho(右乘正交投影矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setFrustum(设置透视投影矩阵) 方法
function testSetFrustum() {
  console.log("测试 setFrustum(设置透视投影矩阵) 方法...");
  
  var m = new Matrix4();
  m.setFrustum(-1, 1, -1, 1, 1, 10);
  // 1，0,  0,      0,
  // 0, 1,  0,      0,
  // 0, 0, -1.222, -2.222,
  // 0, 0, -1,      0
  var result = (Math.abs(m.elements[0] - 1) < 0.0001 && 
                Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[11] + 1) < 0.0001);
  
  console.log("  setFrustum(设置透视投影矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 frustum(右乘透视投影矩阵) 方法
function testFrustum() {
  console.log("测试 frustum(右乘透视投影矩阵) 方法...");
  
  var m = new Matrix4();
  m.frustum(-1, 1, -1, 1, 1, 10);
  
  var result = (Math.abs(m.elements[0] - 1) < 0.0001 && 
                Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[11] + 1) < 0.0001);
  
  console.log("  frustum(右乘透视投影矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setPerspective(通过fovy和aspect设置透视投影矩阵) 方法
function testSetPerspective() {
  console.log("测试 setPerspective(通 过fovy和aspect设置透视投影矩阵) 方法...");
  
  var m = new Matrix4();
  // fovy, aspect, near, far
  m.setPerspective(90, 1, 1, 10);

  var result = (Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[11] + 1) < 0.0001);
  
  console.log("  setPerspective(通 过fovy和aspect设置透视投影矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 perspective(右乘透视投影矩阵) 方法
function testPerspective() {
  console.log("测试 perspective(右乘透视投影矩阵) 方法...");
  
  var m = new Matrix4();
  m.perspective(90, 1, 1, 10);
  
  var result = (Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[11] + 1) < 0.0001);
  
  console.log("  perspective(右乘透视投影矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setScale(设置缩放矩阵) 方法
function testSetScale() {
  console.log("测试 setScale(设置缩放矩阵) 方法...");
  
  var m = new Matrix4();
  m.setScale(2, 3, 4);
  
  var result = (Math.abs(m.elements[0] - 2) < 0.0001 && 
                Math.abs(m.elements[5] - 3) < 0.0001 && 
                Math.abs(m.elements[10] - 4) < 0.0001);
  
  console.log("  setScale(设置缩放矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 scale(应用缩放矩阵) 方法
function testScale() {
  console.log("测试 scale(应用缩放矩阵) 方法...");
  
  var m = new Matrix4();
  m.scale(2, 3, 4);
  
  var result = (Math.abs(m.elements[0] - 2) < 0.0001 && 
                Math.abs(m.elements[5] - 3) < 0.0001 && 
                Math.abs(m.elements[10] - 4) < 0.0001);
  
  console.log("  scale(应用缩放矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setTranslate 方法
function testSetTranslate() {
  console.log("测试 setTranslate(设置平移矩阵) 方法...");
  
  var m = new Matrix4();
  m.setTranslate(1, 2, 3);
  
  var result = (Math.abs(m.elements[12] - 1) < 0.0001 && 
                Math.abs(m.elements[13] - 2) < 0.0001 && 
                Math.abs(m.elements[14] - 3) < 0.0001);
  
  console.log("  setTranslate(设置平移矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 translate(应用平移矩阵) 方法
function testTranslate() {
  console.log("测试 translate(应用平移矩阵) 方法...");
  
  var m = new Matrix4();
  m.translate(1, 2, 3);
  
  var result = (Math.abs(m.elements[12] - 1) < 0.0001 && 
                Math.abs(m.elements[13] - 2) < 0.0001 && 
                Math.abs(m.elements[14] - 3) < 0.0001);
  
  console.log("  translate(应用平移矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setRotate(设置旋转矩阵) 方法
function testSetRotate() {
  console.log("测试 setRotate(设置旋转矩阵) 方法...");
  
  var m = new Matrix4();
  m.setRotate(90, 0, 0, 1); // 绕 Z 轴旋转 90 度

  // 绕 Z 轴旋转 90 度的矩阵
  var expected = [6.123234262925839e-17,1,0,0,-1,6.123234262925839e-17,0,0,0,0,1,0,0,0,0,1];
  var result = true;
  
  for (var i = 0; i < 16; i++) {
    if (Math.abs(m.elements[i] - expected[i]) > 0.0001) {
      result = false;
      break;
    }
  }
  
  console.log("  setRotate(设置旋转矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 rotate(应用旋转矩阵) 方法
function testRotate() {
  console.log("测试 rotate(应用旋转矩阵) 方法...");
  
  var m = new Matrix4();
  m.rotate(90, 0, 0, 1); // 绕 Z 轴旋转 90 度
  
  // 绕 Z 轴旋转 90 度的矩阵
  var expected = [6.123234262925839e-17,1,0,0,-1,6.123234262925839e-17,0,0,0,0,1,0,0,0,0,1];
  var result = true;
  
  for (var i = 0; i < 16; i++) {
    if (Math.abs(m.elements[i] - expected[i]) > 0.0001) {
      result = false;
      break;
    }
  }
  
  console.log("  rotate(应用旋转矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 setLookAt(设置视图矩阵) 方法
function testSetLookAt() {
  console.log("测试 setLookAt(设置视图矩阵) 方法...");
  
  var m = new Matrix4();
  m.setLookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);
  
  // 从 (0,0,5) 看向 (0,0,0)，上方向为 (0,1,0) 的视图矩阵
  var result = (Math.abs(m.elements[0] - 1) < 0.0001 && 
                Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[10] - 1) < 0.0001 && 
                Math.abs(m.elements[14] + 5) < 0.0001);
  
  console.log("  setLookAt(设置视图矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 lookAt(设置视图矩阵) 方法
function testLookAt() {
  console.log("测试 lookAt(设置视图矩阵) 方法...");
  
  var m = new Matrix4();
  m.lookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);
  
  var result = (Math.abs(m.elements[0] - 1) < 0.0001 && 
                Math.abs(m.elements[5] - 1) < 0.0001 && 
                Math.abs(m.elements[10] - 1) < 0.0001 && 
                Math.abs(m.elements[14] + 5) < 0.0001);
  
  console.log("  lookAt(设置视图矩阵) 测试: " + (result ? "通过" : "失败"));
}

// 测试 Vector3 构造函数
function testVector3Constructor() {
  console.log("测试 Vector3 构造函数...");
  
  var v = new Vector3();
  var result = (v.elements.length === 3);
  
  console.log("  Vector3 默认构造函数测试: " + (result ? "通过" : "失败"));
  
  var v2 = new Vector3([1, 2, 3]);
  result = (Math.abs(v2.elements[0] - 1) < 0.0001 && 
            Math.abs(v2.elements[1] - 2) < 0.0001 && 
            Math.abs(v2.elements[2] - 3) < 0.0001);
  
  console.log("  Vector3 带参数构造函数测试: " + (result ? "通过" : "失败"));
}

// 测试 Vector3 normalize 方法
function testVector3Normalize() {
  console.log("测试 Vector3 normalize(归一化) 方法...");
  
  var v = new Vector3();
  v.elements = [1, 2, 3];
  var length = Math.sqrt(v.elements[0] * v.elements[0] 
                       + v.elements[1] * v.elements[1] 
                       + v.elements[2] * v.elements[2]);
  v.normalize();
  var length2 = Math.sqrt(v.elements[0] * v.elements[0] 
                        + v.elements[1] * v.elements[1] 
                        + v.elements[2] * v.elements[2]);
  var result = Math.abs(length2 - 1) < 0.0001;
  if (result) {
    var result1 = Math.abs(v.elements[0] * length - 1) < 0.0001;
    var result2 = Math.abs(v.elements[1] * length - 2) < 0.0001;
    var result3 = Math.abs(v.elements[2] * length - 3) < 0.0001;
    result = result1 && result2 && result3;
  }
  
  console.log("  Vector3 normalize(归一化) 测试: " + (result ? "通过" : "失败"));
}

// 测试 Vector4 构造函数
function testVector4Constructor() {
  console.log("测试 Vector4 构造函数...");
  
  var v = new Vector4();
  var result = (v.elements.length === 4);
  
  console.log("  Vector4 默认构造函数测试: " + (result ? "通过" : "失败"));
  
  var v2 = new Vector4([1, 2, 3, 4]);
  result = (Math.abs(v2.elements[0] - 1) < 0.0001 && 
            Math.abs(v2.elements[1] - 2) < 0.0001 && 
            Math.abs(v2.elements[2] - 3) < 0.0001 && 
            Math.abs(v2.elements[3] - 4) < 0.0001);
  
  console.log("  Vector4 带参数构造函数测试: " + (result ? "通过" : "失败"));
}

// 运行所有测试
function runAllTests() {
  console.log("开始运行 cuon-matrix.js 单元测试...");
  
  testVector3Constructor();
  testVector4Constructor();
  testMatrix4Constructor();
  testVector3Normalize();
  testSetIdentity();
  testSet();
  testConcat();
  testMultiplyVector3();
  testMultiplyVector4();
  testTranspose();
  testSetInverseOf();
  testInvert();
  testSetOrtho();
  testOrtho();
  testSetFrustum();
  testFrustum();
  testSetPerspective();
  testPerspective();
  testSetScale();
  testScale();
  testSetTranslate();
  testTranslate();
  testSetRotate();
  testRotate();
  testSetLookAt();
  testLookAt();
  
  console.log("cuon-matrix.js 单元测试完成！");
}

// 页面加载完成后运行测试
window.onload = function() {
  runAllTests();
};
