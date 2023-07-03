export function addJoysticks(){
   
    // Details in the link bellow:
    // https://yoannmoi.net/nipplejs/
  
    let joystickL = nipplejs.create({
      zone: document.getElementById('joystickWrapper1'),
      mode: 'static',
      position: { top: '-80px', left: '80px' }
    });
    
    joystickL.on('move', function (evt, data) {
      const forward = data.vector.y
      const turn = data.vector.x
      fwdValue = bkdValue = lftValue = rgtValue = 0;
  
      if (forward > 0) 
        fwdValue = Math.abs(forward)
      else if (forward < 0)
        bkdValue = Math.abs(forward)
  
      if (turn > 0) 
        rgtValue = Math.abs(turn)
      else if (turn < 0)
        lftValue = Math.abs(turn)
    })
  
    joystickL.on('end', function (evt) {
      bkdValue = 0
      fwdValue = 0
      lftValue = 0
      rgtValue = 0
    })
  
    let joystickR = nipplejs.create({
      zone: document.getElementById('joystickWrapper2'),
      mode: 'static',
      lockY: true, // only move on the Y axis
      position: { top: '-80px', right: '80px' },
    });
  
    joystickR.on('move', function (evt, data) {
      const changeScale = data.vector.y;
  
      if(changeScale > previousScale) scale+=0.1;
      if(changeScale < previousScale) scale-=0.1;
      if(scale > 4.0) scale = 4.0;
      if(scale < 0.5) scale = 0.5;
  
      previousScale = changeScale;
    })
  }