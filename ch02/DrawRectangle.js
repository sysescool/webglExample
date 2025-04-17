// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  // 获取<canvas>元素
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle  
  // 绘制一个蓝色矩形
  ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
                                          // 设置颜色为蓝色
  ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
                                          // 使用蓝色填充一个矩形
}
