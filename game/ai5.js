'use strict'; /*jslint node:true*/

Object.prototype.toString = function() {
  return this.y.toString() + this.x.toString();
}
Object.prototype.down = function() {
  return (this.y+1).toString() + this.x.toString()
}
Object.prototype.up = function() {
  return (this.y-1).toString() + this.x.toString()
}
Object.prototype.left = function() {
  return this.y.toString() + (this.x-1).toString()
}
Object.prototype.right = function() {
  return this.y.toString() + (this.x+1).toString()
}


exports.play = function*(screen){
  let map = [],history = [],player = {},food = [], diff1, diff2, axisX, axisY, btrpath = [], stage = 0, death_rock = {}, contact, phantom = {}, borders = [], butterfly_num = 0, rocks = [];
  let counter = 0,
      changed = false,
      last_state = { x: -1, y: -1},
      same = false,
      butterflies = [[],[],[]];
  screen.splice(screen.length-1, 1);
  for (let e = 0; e < screen.length; e++) {
    map.push([]);
    if (e == 0 || e == screen.length-1) continue;
    for (let i = 0; i < screen[e].length; i++) {
      if ( i == 0 || i == screen[e].length-1) { 
        map[e].push('');
        continue;
      }
      if ("/|\\-".includes(screen[e][i]) && butterfly_num == 0) {
        butterflies[butterfly_num].push({y:e, x:i});
        butterfly_num++;
      } else if ("/|\\-".includes(screen[e][i]) && butterfly_num == 1) {
        butterflies[butterfly_num].push({y:e, x:i});
        butterfly_num++;
      } else if ("/|\\-".includes(screen[e][i]) && butterfly_num == 2) {
        butterflies[butterfly_num].push({y:e, x:i});
        butterfly_num = 0;
      }
      let itog = { UP: false, DOWN: false, RIGHT: false, LEFT: false };

      if (!'#+'.includes(screen[e-1][i])) itog.UP = true;
      if (!'#+'.includes(screen[e+1][i])) itog.DOWN = true;
      if (!'#+'.includes(screen[e][i+1])) itog.RIGHT = true;
      if (!'#+'.includes(screen[e][i-1])) itog.LEFT = true;
      map[e].push(itog);
    }
  }
  while (true){
    player = {}, food = [], rocks = [];
    let butterfly = {};
    for (let e = 0; e < screen.length-1; e++) {
      for (let i = 0; i < screen[e].length; i++) {
        if (screen[e][i] === '*') {
          food.push({y:e, x:i});
        } else if (screen[e][i] === 'A') {
          player.y = e;
          player.x = i;
        } else if ("/|\\-".includes(screen[e][i])) {
            butterfly.y = e;
            butterfly.x = i;
            butterfly.t = counter;
           
        }  else if (screen[e][i] == 'O') {
          rocks.push({y:e, x:i});
        }
        if (butterfly_num > 0 && "/|\\-".includes(screen[e][i])) {//этого условия достаточно
          butterflies.forEach(item => {
            if (butterfly.toString() === item[item.length-1].toString()) item.push(Object.assign({},butterfly));
            else if (butterfly.up() === item[item.length-1].toString()) item.push(Object.assign({},butterfly));
            else if (butterfly.down() === item[item.length-1].toString()) item.push(Object.assign({},butterfly));
            else if (butterfly.left() === item[item.length-1].toString()) item.push(Object.assign({},butterfly));
            else if (butterfly.right() === item[item.length-1].toString()) item.push(Object.assign({},butterfly));
          });
        }
      }
    }
    
    if (stage === 0) {
      //
      butterfly_num++;
      yield ' ';
      butterfly = butterflies[0][butterflies[0].length-1];
      if (history.length && (butterfly.toString() != history[history.length-1].toString())) changed = true;
      history.push(butterfly);
      
      if (changed) {
        
        let arr = history.map(item => item.toString());
        let arr2 = btrpath.map(item => item.toString());
        
        let unique = [...new Set(arr)]; 
        let unique2 = [...new Set(arr2)]; 

        let flag = unique.length === unique2.length;
        

        if (flag && btrpath.length > 1 && butterfly.toString() == btrpath[0].toString() && btrpath[btrpath.length-1].toString() !== butterfly.toString()) {
          

          history = [];
          stage = 1;
          
          btrpath.forEach(item => {
            if (screen[item.y+1][item.x] == ':') borders.push(`${item.y+1}${item.x}`);
            if (screen[item.y-1][item.x] == ':') borders.push(`${item.y-1}${item.x}`);
            if (screen[item.y][item.x+1] == ':') borders.push(`${item.y}${item.x+1}`);
            if (screen[item.y][item.x-1] == ':') borders.push(`${item.y}${item.x-1}`);
          });

          borders = [...new Set(borders)];

          btrpath.sort((a,b) => (a.y - b.y) + (a.x - b.x));
          
          contact = btrpath[0];

          death_rock = rocks[0];
          debugger;
        } else {
          btrpath.push(butterfly);
          counter++;
        }
      }

    } else if (stage === 1) {
      if (death_rock.x < contact.x) {
        map[contact.y] = map[contact.y].map((item,i) => {
          if (i >= death_rock.x && i < contact.x && i < 39) {
            item.UP = false
          }
          return item;
        })
        
        map[contact.y-1] = map[contact.y-1].map((item,i) => {
          if (i >= death_rock.x && i < contact.x && i < 39) {
            item.DOWN = false
          }
          return item;
        })
      } else {
        map[contact.y] = map[contact.y].map((item,i) => {
          if (i <= death_rock.x && i > contact.x && i < 39) {
            item.UP = false
          }
          return item;
        })
        
        map[contact.y-1] = map[contact.y-1].map((item,i) => {
          if (i <= death_rock.x && i > contact.x && i < 39) {
            item.DOWN = false
          }
          return item;
        })
      }
      
      diff1 = Math.abs(player.x - death_rock.x);
      diff2 = Math.abs(player.y - death_rock.y);
      
      // if (diff1 > 1 && diff2 > 1) {
      //   phantom.y = 5
      //   phantom.x = 20
      //   stage = 2;
      // } else {
      //   stage = 4;
      // }
      stage = 3

    } else if (stage == 2) {
      
      diff1 = Math.abs(player.x - phantom.x);
      diff2 = Math.abs(player.y - phantom.y);
    
      axisX = diff1 >= diff2;
      axisY = diff2 >= diff1;
      history.push(player.toString());
      
      if (axisY && player.y > phantom.y && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
      else if (axisY && player.y > phantom.y && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
      else if (axisY && player.y > phantom.y && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
      else if (axisY && player.y > phantom.y && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
      else if (axisY && player.y < phantom.y && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
      else if (axisY && player.y < phantom.y && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
      else if (axisY && player.y < phantom.y && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
      else if (axisY && player.y < phantom.y && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
      else if (axisX && player.x < phantom.x && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
      else if (axisX && player.x < phantom.x && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
      else if (axisX && player.x < phantom.x && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
      else if (axisX && player.x < phantom.x && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
      else if (axisX && player.x > phantom.x && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
      else if (axisX && player.x > phantom.x && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
      else if (axisX && player.x > phantom.x && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
      else if (axisX && player.x > phantom.x && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
      else history = [];
      
      if (phantom.toString() == player.toString()) { 
        stage = 3; 
        history = [];
      }
      
    } else if (stage == 3) {
      diff1 = Math.abs(player.x - death_rock.x);
      diff2 = Math.abs(player.y - death_rock.y);
    
      axisX = diff1 >= diff2;
      axisY = diff2 >= diff1;
      history.push(player.toString());
      
      if (axisY && player.y > death_rock.y && map[player.y][player.x].UP && !history.includes(player.up()) && !borders.includes(player.up()) ) yield 'u';
      else if (axisY && player.y > death_rock.y && map[player.y][player.x].RIGHT && !history.includes(player.right()) && !borders.includes(player.right()) ) yield 'r';
      else if (axisY && player.y > death_rock.y && map[player.y][player.x].LEFT && !history.includes(player.left()) && !borders.includes(player.left()) ) yield 'l';
      else if (axisY && player.y > death_rock.y && map[player.y][player.x].DOWN && !history.includes(player.down()) && !borders.includes(player.down()) ) yield 'd';
      else if (axisY && player.y < death_rock.y && map[player.y][player.x].DOWN && !history.includes(player.down()) && !borders.includes(player.down()) ) yield 'd';
      else if (axisY && player.y < death_rock.y && map[player.y][player.x].RIGHT && !history.includes(player.right()) && !borders.includes(player.right()) ) yield 'r';
      else if (axisY && player.y < death_rock.y && map[player.y][player.x].LEFT && !history.includes(player.left()) && !borders.includes(player.left()) ) yield 'l';
      else if (axisY && player.y < death_rock.y && map[player.y][player.x].UP && !history.includes(player.up()) && !borders.includes(player.up()) ) yield 'u';
      else if (axisX && player.x < death_rock.x && map[player.y][player.x].RIGHT && !history.includes(player.right()) && !borders.includes(player.right()) ) yield 'r';
      else if (axisX && player.x < death_rock.x && map[player.y][player.x].UP && !history.includes(player.up()) && !borders.includes(player.up()) ) yield 'u';
      else if (axisX && player.x < death_rock.x && map[player.y][player.x].DOWN && !history.includes(player.down()) && !borders.includes(player.down()) ) yield 'd';
      else if (axisX && player.x < death_rock.x && map[player.y][player.x].LEFT && !history.includes(player.left()) && !borders.includes(player.left())) yield 'l';
      else if (axisX && player.x > death_rock.x && map[player.y][player.x].LEFT && !history.includes(player.left()) && !borders.includes(player.left())) yield 'l';
      else if (axisX && player.x > death_rock.x && map[player.y][player.x].UP && !history.includes(player.up()) && !borders.includes(player.up())) yield 'u';
      else if (axisX && player.x > death_rock.x && map[player.y][player.x].DOWN && !history.includes(player.down()) && !borders.includes(player.down())) yield 'd';
      else if (axisX && player.x > death_rock.x && map[player.y][player.x].RIGHT && !history.includes(player.right()) && !borders.includes(player.right())) yield 'r';
      else history = [];
      
      if (diff1 <= 1 && diff2 <= 1) { 
        stage = 4; 
        history = [];
      }
      
    } else if (stage == 4) {
      
      //расчищаем путь
      diff1 = Math.abs(contact.x - death_rock.x);
      diff2 = Math.abs(contact.y - death_rock.y);
    
      
  
      if (death_rock.x < contact.x) {
        if (player.x < death_rock.x && death_rock.y == player.y) {
          yield 'u';
          yield 'r';
          yield 'r';
          yield 'd';

        } else if (player.x > death_rock.x && death_rock.y == player.y) {
          if (player.x < contact.x) yield 'r';
          else stage = 5;
        } else if (player.y > death_rock.y && death_rock.x == player.x) {
          yield 'r';

        } else if (player.y < death_rock.y && death_rock.x == player.x) {
          yield 'r';
          yield 'd';
  
        } else {
          yield ' ';
    
        }
      } else {
        if (player.x < death_rock.x && death_rock.y == player.y) {
          if (player.x > contact.x) yield 'l';
          else stage = 5;

        } else if (player.x > death_rock.x && death_rock.y == player.y) {
          yield 'u';
          yield 'l';
          yield 'l';
          yield 'd';
        } else if (player.y > death_rock.y && death_rock.x == player.x) {
          yield 'l';

        } else if (player.y < death_rock.y && death_rock.x == player.x) {
          yield 'l';
          yield 'd';
  
        } else {
          yield ' ';
    
        }
      }
      
    } else if (stage == 5) {
      if (death_rock.x < contact.x) {
        if (player.x > death_rock.x+1) yield 'l';
        else { 
          stage = 6;
        }
      } else {
        if (player.x < death_rock.x-1) yield 'r';
        else { 
          stage = 6;
        }
      }
    } else if (stage == 6) {
      if (death_rock.x < contact.x) {
        yield 'u';
        yield 'l';
        yield 'l';
        yield 'd';

      } else {
        yield 'u';
        yield 'r';
        yield 'r';
        yield 'd';
      }
      stage = 7
      
    } else if (stage == 7) {
      death_rock = rocks[0];

      if (death_rock.x < contact.x) {
        if (death_rock.x < contact.x) yield 'r'; 
        else stage = 8;
      } else {
        if (death_rock.x > contact.x) yield 'l'; 
        else stage = 8;
      }

    } else if (stage == 8) {
      death_rock = rocks[0];
      if (Math.abs(death_rock.y - contact.y) > 2) {
        if (player.x < death_rock.x) {
          yield 'd';
          yield 'r';
          yield 'r';
          yield ' ';
        } else {
          yield 'd';
          yield 'l';
          yield 'l';
          yield ' ';
        }
      } else {
        stage = 9;
        changed = false;
      }

    } else if (stage == 9) {
      butterfly = butterflies[0][butterflies[0].length-1];
      // let max_y = Math.max(...btrpath.map(item => { 
      //   if (item.x == contact.x) return item.y 
      // }))//
      
      btrpath.sort((a,b) => a.t-b.t);
      
      let i = 0;
      
      while(btrpath[0].toString() !== contact.toString() || btrpath[btrpath.length-1].toString() === contact.toString() ) {
        btrpath.unshift(btrpath.pop());
      }

      
      if ((last_state.toString() != butterfly.toString()) && last_state.x != -1) {
        changed = true;
      }
  
      if (changed && (butterfly.toString() == btrpath[0].toString())) {
        // бабочка находится в начале своего пути
        stage = 10;
      } else {
        yield ' ';
      }
  
      
      
      // let predict = (cur_ind + 5) % btrpath.length;
      last_state.y = butterfly.y;
      last_state.x = butterfly.x;

      //проверям подложение ножниц
      //ждём пока ножници займут нижнюю позицию на вертикали
      
    } else if (stage == 10) {
      //здесь мы можем вычислять будущее положение бабочек
      
      let arr = btrpath.map(item => {
        return item.toString();
      });
      
      let unique = [btrpath[0].toString()];
      
      for (let i =  1; i < btrpath.length; i++) {
        if (arr[i] !== arr[i-1]) {
          unique.push(arr[i]);
        }
      }
      
      let ind = 0;
  
      if (unique.length > 2) {
        ind = unique.length - 2;
      } else {
        ind = unique.length - 1;
      }

      let next = 0;
      for (let i = 0; i < arr.length; i++) {
        if (i > 0 && arr[i] !== arr[i-1]) next++;
        if (arr[i] == unique[ind] && next == ind) {
           stage++;
           break;
         }
         yield ' ';
        
      }
      
    } else if (stage == 11) {
      if (player.x < contact.x) {
        yield 'd';
        yield 'r';
        yield 'r';
        yield 'u';
  
      } else {
        yield 'd';
        yield 'l';
        yield 'l';
        yield 'u';
 
      }
      yield 'u';
      stage = 12;
    } else if (stage == 12) {
      map = [];
      screen.splice(screen.length-1, 1);
      for (let e = 0; e < screen.length; e++) {
        map.push([]);
        if (e == 0 || e == screen.length-1) continue;
        for (let i = 0; i < screen[e].length; i++) {
          if ( i == 0 || i == screen[e].length-1) { 
            map[e].push('');
            continue;
          }
          let itog = { UP: false, DOWN: false, RIGHT: false, LEFT: false };

          if (!'#+'.includes(screen[e-1][i])) itog.UP = true;
          if (!'#+'.includes(screen[e+1][i])) itog.DOWN = true;
          if (!'#+'.includes(screen[e][i+1])) itog.RIGHT = true;
          if (!'#+'.includes(screen[e][i-1])) itog.LEFT = true;
          map[e].push(itog);
        }
      }
      stage = 13;
    } else {
      food = food.map(a => {
        a.diff = Math.abs(a.x - player.x) + Math.abs(a.y - player.y)
        return a
      });
      food.sort((a,b) => {
        return a.diff - b.diff == 0 ? a.y - b.y : a.diff - b.diff;
      });
      if (food[0]) {
        diff1 = Math.abs(player.x - food[0].x);
        diff2 = Math.abs(player.y - food[0].y);
      }
      axisX = diff1 >= diff2;
      axisY = diff2 >= diff1;
      history.push(player.toString());

      if (food[0]) {
        if (axisY && player.y > food[0].y && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
        else if (axisY && player.y > food[0].y && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
        else if (axisY && player.y > food[0].y && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
        else if (axisY && player.y > food[0].y && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
        else if (axisY && player.y < food[0].y && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
        else if (axisY && player.y < food[0].y && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
        else if (axisY && player.y < food[0].y && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
        else if (axisY && player.y < food[0].y && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
        else if (axisX && player.x < food[0].x && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
        else if (axisX && player.x < food[0].x && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
        else if (axisX && player.x < food[0].x && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
        else if (axisX && player.x < food[0].x && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
        else if (axisX && player.x > food[0].x && map[player.y][player.x].LEFT && !history.includes(player.left()) ) yield 'l';
        else if (axisX && player.x > food[0].x && map[player.y][player.x].UP && !history.includes(player.up()) ) yield 'u';
        else if (axisX && player.x > food[0].x && map[player.y][player.x].DOWN && !history.includes(player.down()) ) yield 'd';
        else if (axisX && player.x > food[0].x && map[player.y][player.x].RIGHT && !history.includes(player.right()) ) yield 'r';
        else history = [];
      } else {
        return 1;
      }
      if (food[0] && food[0].diff == 1) history = [];
    }
    
  }
};
