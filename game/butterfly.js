'use strict'; /*jslint node:true*/

function find_elem(screen, elem) {
  for (let y = 0; y <screen.length; y++)
  {
      let row = screen[y];
      for (let x = 0; x <row.length; x++)
      {
          if (elem.includes(row[x])) return {x, y};
      }
  }
}


function move_rock_to_left(position,x) {
  let itog,
      movementLeft = Array(x-1).join('l'),
      movementRight = Array(x-1).join('r');
  
  switch (position) {
    case 'UPRIGHT':
      itog = 'lld' + movementLeft + movementRight + 'urrdl' + movementLeft;
      break;
    case 'UPMIDDLE':
      itog = 'ld' + movementLeft + movementRight + 'urrdl' + movementLeft;
      break;
    case 'UPLEFT':
      itog = 'd' + movementLeft + movementRight + 'urrdl' + movementLeft;
      break;
    default:
      itog = movementLeft + 'l';
      break;
  }
  return itog
}

function move_rock_to_right(position, x) {
  let itog,
      movementRight = Array(x-1).join('r'),
      movementLeft = Array(x-1).join('l');
      
      switch (position) {
        case 'UPRIGHT':
          itog = 'd' + movementRight + movementLeft + 'ulldr' + movementRight;
          break;
        case 'UPMIDDLE':
          itog = 'rd' + movementRight + movementLeft + 'ulldr' + movementRight;
          break;
        case 'UPLEFT':
          itog = 'rrd' + movementRight + movementLeft + 'ulldr' + movementRight;
          break;
        default:
          itog = movementRight + 'r';
          break;
      }
      return itog
}


function find_path(item, player, screen) {
  
  let path = '',
      difference_y = Math.abs(item.y - player.y),
      difference_x = Math.abs(item.x - player.x);
      
  while(difference_x + difference_y) {
    if (difference_y && player.y > item.y) {
      path += 'u';
      difference_y--;
    } else if (difference_y && player.y < item.y) {
      path += 'd';
      difference_y--;
    } else if (difference_x && player.x > item.x) {
      path += 'l';
      difference_x--;
    } else if (difference_x && player.x < item.x){
      path += 'r';
      difference_x--;
    }
  }
  
  return path;
}

function find_food(player, screen) {
  
}




exports.play = function*(screen){
    
    let moves = '';
    let step = 0;
    let memory = [];
    
    //под камнем
    let down_right = 'uuulldr';
    let down_left = 'uuurrdl';
    let down_middle = 'ulur';
    let down_middle_reverse = 'urul';
    
    //над камнем
    let up_right = 'dddlluur';
    let up_left = 'dddrruul';
    let up_middle = 'rdddlluur';
    let up_middle_reverse = 'ldddrruul';
    
    
    
    let counter = 0;//счётчик для отслеживания положения бабочек
    
    let direction = 'y',
        difference_x = 0,
        difference_y = 0;
    
    
    let current_target = find_elem(screen, '*');
    
    let map = [];
    
    screen.splice(screen.length-1, 1);
    
    for (let e = 0; e < screen.length; e++) {
      map.push([]);
      if (e == 0 || e == screen.length-1) continue;
      for (let i = 0; i < screen[e].length; i++) {
        if ( i == 0 || i == screen[e].length-1) { 
          map[e].push('');
          continue;
        }
        let itog = '';
        if (!'#+'.includes(screen[e-1][i])) itog += 'u';
        if (!'#+'.includes(screen[e+1][i])) itog += 'd';
        if (!'#+'.includes(screen[e][i+1])) itog += 'r';
        if (!'#+'.includes(screen[e][i-1])) itog += 'l';
        map[e].push(itog);
      }
    }
    
    let history = [];
    let next_step = '';
    
    while (true){
      let player = find_elem(screen, 'A');
      // let butterfly = find_elem(screen, '-|\\/');
      // let ball = find_elem(screen, 'O');
      history.push(player.y.toString() + player.x.toString());

      // if ( (butterfly.x.toString() + butterfly.y.toString() === memory[0]) && memory.length > 1) {
      // 
      // } else {
      //   memory.push(butterfly.x.toString() + butterfly.y.toString());
      // }

      
      // let min_height = ball.y + 2; // нижняя грань области камня
      // let max_height = ball.y - 1; //верхняя грань области камня
      
      debugger;
      
      if (moves.length == 0) {
          // moves += find_path(current_target, player, screen);
          if (direction == 'x') {
            if ( player.x > current_target.x) {
              if (screen[player.y][player.x-1] == '+') moves += map[player.y][player.x][Math.floor(Math.random()*map[player.y][player.x].length)]
              else moves += 'l';
            } else if (player.x < current_target.x) {
              if (screen[player.y][player.x+1] == '+') moves += map[player.y][player.x][Math.floor(Math.random()*map[player.y][player.x].length)]
              else moves += 'r';
            }
          } else {
            if (player.y > current_target.y) {
              if (screen[player.y-1][player.x] == '+') moves += map[player.y][player.x][Math.floor(Math.random()*map[player.y][player.x].length)]
              else moves += 'u';  
            } else if (player.y < current_target.y) {
              if (screen[player.y+1][player.x] == '+') moves += map[player.y][player.x][Math.floor(Math.random()*map[player.y][player.x].length)]
              else moves += 'd';
              
            } 
          }
          
          switch (moves) {
            case 'u':
              next_step = (player.y-1).toString() + player.x.toString();
              break;
            case 'd':
              next_step = (player.y+1).toString() + player.x.toString();
              break;
            case 'l':
              next_step = player.y.toString() + (player.x-1).toString();
              break;
            case 'r':
              next_step = player.y.toString() + (player.x+1).toString();
              break;
          }
          
          if (history.includes(next_step)) {
            while(true) {
              let generate_step = map[player.y][player.x][Math.floor(Math.random()*map[player.y][player.x].length)];
              if (generate_step != moves) { 
                moves = generate_step;
                break;
              } else if (map[player.y][player.x].length == 1) {
                moves = generate_step;
                break;
              }
            }
            
          }
          
          direction = direction == 'y' ? 'x' : 'y';
          
        // if (player.x < 20) {
        //   if (player.y == max_height && player.x == ball.x-1) moves += move_rock_to_right('UPLEFT', 20);
        //   else if (player.y == max_height && player.x == ball.x+1) moves += move_rock_to_right('UPRIGHT', 20);
        //   else if (player.y == max_height && player.x == ball.x) moves += move_rock_to_right('UPMIDDLE', 20);
        // } else {
        //   if (player.y == max_height && player.x == ball.x-1) moves += move_rock_to_left('UPLEFT', 20);
        //   else if (player.y == max_height && player.x == ball.x+1) moves += move_rock_to_left('UPRIGHT', 20);
        //   else if (player.y == max_height && player.x == ball.x) moves += move_rock_to_left('UPMIDDLE', 20);
        // }
        // 
      
      } else {
    
        yield moves;
        moves = '';
        next_step = '';
        player = find_elem(screen, 'A');
        if (player.x == current_target.x && player.y == current_target.y) {
          current_target = find_elem(screen, '*');
          history = [];
          
        }

      }
      
      
      if (!current_target) return 1;
      counter++;
    }
};
