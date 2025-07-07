window.onload = () => {
  const pet = document.getElementById('pet');
  const petImage = document.getElementById('pet-image');
  const speechBubble = document.getElementById('speech-bubble');
  petImage.ondragstart = () => false;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let isPaused = false;
  let currentX = 0;
  let currentY = 0;
  let isChasingMouse = false;
  let chaseTarget = { x: 0, y: 0 };
  let lastAngleChangeTime = 0;
  let lastWallHitTime = 0;
  let moodLockUntil = 0;

  const ANGLE_COOLDOWN = 300;     // ms
  const WALL_COOLDOWN = 2000;     // ms
  const WALL_ANIM_DURATION = 1500;

  // 随机动作定时器
  let restTimer;
  const ACTION_INTERVAL = 15000;

  window.electronAPI.onInitPosition(({ x, y }) => {
    currentX = x;
    currentY = y;
  });

  function showSpeechBubble() {
    const messages = ['别碰我！', '你到底想干嘛？', '滚开！别烦我！'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    speechBubble.textContent = randomMessage;
    speechBubble.style.display = 'block';
    setTimeout(() => {
      speechBubble.style.display = 'none';
    }, 2000);
  } 
  // 拖动事件
  pet.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX;
    offsetY = e.clientY;
    petImage.src = '../images/pet_wave.gif';
    showSpeechBubble();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const newX = e.screenX - offsetX;
      const newY = e.screenY - offsetY;
      window.electronAPI.moveWindow(newX, newY);
      currentX = newX;
      currentY = newY;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (isDragging) {
      isDragging = false;
      petImage.src = '../images/pet.png';
      isChasingMouse = true;
      chaseTarget = { x: e.screenX, y: e.screenY };
      setTimeout(() => {
        isChasingMouse = false;
      }, 3000);
    }
  });

  // 点击互动
  pet.addEventListener('click', () => {
    
  });

  let speed = 5;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  let angle = Math.random() * 2 * Math.PI;

  function handleWallCollision() {
    const now = Date.now();
    let hitWall = false;

    if (currentX <= -55) {
      currentX = -55;
      angle = Math.PI - angle;
      hitWall = true;
    }
    if (currentX >= screenWidth - 150) {
      currentX = screenWidth - 150;
      angle = Math.PI - angle;
      hitWall = true;
    }
    if (currentY <= -75) {
      currentY = -75;
      angle = -angle;
      hitWall = true;
    }
    if (currentY >= screenHeight - 175) {
      currentY = screenHeight - 175;
      angle = -angle;
      hitWall = true;
    }

    // 撞墙触发表情 + 冷却逻辑
    if (hitWall && now - lastWallHitTime > WALL_COOLDOWN) {
      lastWallHitTime = now;
      moodLockUntil = now + WALL_ANIM_DURATION;
      const mood = Math.random() < 0.5 ? 'cry' : 'angry';
      petImage.src = `../images/pet_${mood}.gif`;
      setTimeout(() => {
        // 只有在没被其他行为覆盖时才恢复
        if (Date.now() >= moodLockUntil) {
          petImage.src = '../images/pet.png';
        }
      }, WALL_ANIM_DURATION);
    }

    return hitWall;
  }

  function autoMove() {
    const now = Date.now();
    let dx, dy;

    if (!isDragging && !isPaused) {
      speed = 5;
      // 限制 angle 变化频率
      if (now - lastAngleChangeTime > ANGLE_COOLDOWN) {
        angle += (Math.random() - 0.5) * 0.4;
        lastAngleChangeTime = now;
      }
      dx = Math.cos(angle) * speed;
      dy = Math.sin(angle) * speed;

      currentX += dx;
      currentY += dy;

      handleWallCollision();

      // 设置镜像翻转
      petImage.style.transform = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
      window.electronAPI.moveWindow(currentX, currentY);
    }

    setTimeout(autoMove, 30);
  }
  autoMove();
};