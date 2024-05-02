function init() {
  var canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = "#222";
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext("2d");
  var maxcolor = 225; // яркость кружков
  var fps = 60;
  var grid;
  var last;
  var clear = false;

  findHexWithWidthAndHeight(110, 100);
  HT.Hexagon.Static.ORIENTATION = HT.Hexagon.Orientation.Normal;
  grid = new HT.Grid(canvas.width, canvas.height);

  window.setInterval(update, 1000 / fps);

  function Rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function Randf(min, max) {
    return Math.random() * (max - min) + min;
  }

  function drowCircle(x, y, r, c, a, b) {
    //ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.beginPath();
    // arc(x, y, radius, startAngle, endAngle, направление)
    ctx.arc(x, y, r, 0, (a * Math.PI) / 180, b); // Outer circle
    ctx.stroke();
    //ctx.fill();
  }

  // Генерация цвета
  function colorGen() {
    var c = [0, 0, 0];
    n = Rand(0, 2);
    c[n] = maxcolor;
    do {
      m = Rand(0, 2);
    } while (m == n);
    c[m] = Rand(0, maxcolor);
    var str = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
    //console.log(str);
    return str;
  }

  function findHexWithWidthAndHeight(width, height) {
    var y = height / 2.0;

    //solve quadratic
    var a = -8.0;
    var b = -2.0 * width;
    var c = Math.pow(width, 2) + Math.pow(height, 2);

    var z = (-b - Math.sqrt(Math.pow(b, 2) - 4.0 * a * c)) / (2.0 * a);

    var x = (width - z) / 2.0;

    HT.Hexagon.Static.WIDTH = width;
    HT.Hexagon.Static.HEIGHT = height;
    HT.Hexagon.Static.SIDE = z;
  }

  function drawHexGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var h in grid.Hexes) {
      /*if(grid.Hexes[h].isInBounds(mouseX,mouseY) && isMouseDown)
				grid.Hexes[h].click();*/
      grid.Hexes[h].draw(ctx);
    }
  }

  // Start paint
  drawHexGrid();

  //mouse
  var mouseX = 0,
    mouseY = 0,
    isMouseDown;
  var canvasPosition = { x: 0, y: 0 };

  function handleMouseDown(e) {
    isMouseDown = true;
  }

  document.addEventListener("mousedown", handleMouseDown, true);
  document.addEventListener("touchstart", handleMouseDown, true);

  function handleMouseUp() {
    isMouseDown = false;
  }

  document.addEventListener("mouseup", handleMouseUp, true);
  document.addEventListener("touchend", handleMouseUp, true);

  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("touchmove", handleMouseMove, true);

  document.addEventListener("dblclick", handleMouseClick, true);

  function handleMouseMove(e) {
    var clientX, clientY;
    if (e.clientX) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      var touch = e.changedTouches[e.changedTouches.length - 1];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      return;
    }
    mouseX = clientX - canvasPosition.x;
    mouseY = clientY - canvasPosition.y;
    e.preventDefault();
  }

  function handleMouseClick() {
    clear = !clear;
  }

  //update
  function update() {
    var n = grid.GetHexAt(new HT.Point(mouseX, mouseY));
    if (n != undefined) {
      n.selected = true;
      if (last != n && last != undefined) last.selected = false;
      if (isMouseDown)
        if (!clear) n.select = true;
        else n.select = false;
      drawHexGrid();
      n.draw(ctx);
      last = n;
    }
  }
}
