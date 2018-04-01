let btrflies = [],
    btr_unique = [],//массив уникальных точек хода бабочек
    contacts = [],
    borders = [],
    rocks = [],
    obj = {},
    counter = 0,
    player = {},
    stage = 0,
    food = [],
    diff1 = 0,
    diff2 = 0,
    axisX = false,
    axisY = false,
    history = [],
    current_btr = [],
    index = -1, //за 2 хода до взрыва,
    can_move = true,
    btrpath = [];


function move() {
    if (axisY && player.y > food[0].y && !borders.includes(player.up) && !history.includes(player.up) && (player.y - 1) != 0 ) return 'u';
    else if (axisY && player.y > food[0].y && !borders.includes(player.right) && !history.includes(player.right) ) return 'r';
    else if (axisY && player.y > food[0].y && !borders.includes(player.left) && !history.includes(player.left) ) return 'l';
    else if (axisY && player.y > food[0].y && !borders.includes(player.down) && !history.includes(player.down) ) return 'd';
    else if (axisY && player.y < food[0].y && !borders.includes(player.down) && !history.includes(player.down) ) return 'd';
    else if (axisY && player.y < food[0].y && !borders.includes(player.right) && !history.includes(player.right)  ) return 'r';
    else if (axisY && player.y < food[0].y && !borders.includes(player.left) && !history.includes(player.left) ) return 'l';
    else if (axisY && player.y < food[0].y && !borders.includes(player.up) && !history.includes(player.up) && (player.y - 1) != 0 ) return 'u';
    else if (axisX && player.x < food[0].x && !borders.includes(player.right) && !history.includes(player.right)  ) return 'r';
    else if (axisX && player.x < food[0].x && !borders.includes(player.up) && !history.includes(player.up) && (player.y - 1) != 0 ) return 'u';
    else if (axisX && player.x < food[0].x && !borders.includes(player.down) && !history.includes(player.down)) return 'd';
    else if (axisX && player.x < food[0].x && !borders.includes(player.left) && !history.includes(player.left) ) return 'l';
    else if (axisX && player.x > food[0].x && !borders.includes(player.left) && !history.includes(player.left)) return 'l';
    else if (axisX && player.x > food[0].x && !borders.includes(player.up) && !history.includes(player.up) && (player.y - 1) != 0 ) return 'u';
    else if (axisX && player.x > food[0].x && !borders.includes(player.down) && !history.includes(player.down) ) return 'd';
    else if (axisX && player.x > food[0].x && !borders.includes(player.right) && !history.includes(player.right) ) return 'r';
    else history = [];
}

exports.play = function*(screen){
    while (true) {
        if (stage === 0) {
            for (let e = 1; e < screen.length-1; e++) {
                for (let i = 0; i < screen[e].length; i++) {
    
                    //объект нужен всегда
                    obj.y = e;
                    obj.x = i;
                    obj.str = `${e}${i}`;
                    obj.up = `${e-1}${i}`;
                    obj.down = `${e+1}${i}`;
                    obj.left = `${e}${i-1}`;
                    obj.right = `${e}${i+1}`;
    
                    if ("/|\\-".includes(screen[e][i])) {
    
                        if (counter > 0) { // если массив не пустой
    
                            btrflies.forEach(item => {
                                if (obj.str === item[item.length-1].str) item.push(Object.assign({},obj));
                                else if (obj.up === item[item.length-1].str) item.push(Object.assign({},obj));
                                else if (obj.down === item[item.length-1].str) item.push(Object.assign({},obj));
                                else if (obj.left === item[item.length-1].str) item.push(Object.assign({},obj));
                                else if (obj.right === item[item.length-1].str) item.push(Object.assign({},obj));
                            });
    
                            borders.push(obj.up, obj.down, obj.right, obj.left); //все ячейки вокруг бабочек недоступны для хода
    
                        } else { // массив пустой, первый проход
                            btrflies.push([Object.assign({},obj)]);//создать массив с бабочками
                            borders.push(obj.up, obj.down, obj.right, obj.left); //все ячейки вокруг бабочек недоступны для хода
                        }
                    } else if (screen[e][i] === 'O' && counter === 0) { //counter === 0 - только при первом проходе
                        rocks.push(Object.assign({},obj));
                    } else if (screen[e][i] === '*' && counter === 0) {
                        borders.push(obj.str);
                    }
                }
            }
            yield ' ';
            if (counter === 30) stage++;

        } else if (stage === 1) {
            borders = [...new Set(borders)];//уникальное количество ячеек в на которые нельзя заходить

            btr_unique = btrflies.map(item => item.map(d => d.str) ); 
            btr_unique = btr_unique.map(item => [...new Set(item)]);//уникальные точки для хода бабочек

            contacts = JSON.parse(JSON.stringify(btr_unique)); //copy


            contacts = contacts.map( (item,i) => { //поиск верхних левых точек
                item.sort((a,b) => a - b);
                for (let j = 0; j < btrflies[i].length; j++) {
                    if (btrflies[i][j].str === item[0]) return btrflies[i][j];
                }
            });


            //поиск ближайших камней
            contacts.forEach(contact => {
                
                let avalible_rocks = rocks.filter(rock => rock.y < contact.y);//интересуют камни которые выше точки контакта
                
                avalible_rocks.forEach(rock => {
                    rock.diff = Math.abs(contact.x - rock.x) + Math.abs(contact.y - rock.y)
                });

                avalible_rocks.sort((a,b) => a.diff - b.diff);

                contact.rock = avalible_rocks[0];

                food.push({ y: contact.rock.y-1, x: contact.rock.x });//для будущего stage
                
            });

            rocks = rocks.map(rock => rock.str);//для функции move

            stage++;
        } else if (stage === 2) {
            current_btr = new Array(btrflies.length);
            for (let e = 0; e < screen.length-1; e++) {
                for (let i = 0; i < screen[e].length; i++) {
        
                    if (screen[e][i] === 'A') {
                        obj.y = e;
                        obj.x = i;
                        obj.str = `${e}${i}`;
                        obj.up = `${e-1}${i}`;
                        obj.down = `${e+1}${i}`;
                        obj.left = `${e}${i-1}`;
                        obj.right = `${e}${i+1}`;
                        player = Object.assign({},obj);
                    } else if ("/|-\\".includes(screen[e][i])) {
                        obj.y = e;
                        obj.x = i;
                        obj.str = `${e}${i}`;
                        obj.up = `${e-1}${i}`;
                        obj.down = `${e+1}${i}`;
                        obj.left = `${e}${i-1}`;
                        obj.right = `${e}${i+1}`;
                        
                        btrflies.forEach((item, i) => {
        
                            let btr = item.map(d => d.str);
                            if (btr.includes(obj.str)) {
                                current_btr[i] = Object.assign({},obj);
                            }
                        });
                        
                    }
                }
            }

            if (food[0]) {

                diff1 = Math.abs(player.x - food[0].x);
                diff2 = Math.abs(player.y - food[0].y);
                axisX = diff1 >= diff2;
                axisY = diff2 >= diff1;
                history.push(player.str);
                if (can_move) yield move();

               


                if (diff1  == 0 && diff2 == 0 || index > -1) {
                    //здесь должна быть функция отвечающая за сброс камня drop_stone()
                    if (current_btr[0].str === contacts[0].str) {
                        can_move = false;
                        yield 'l';
                        yield 'd';
                        yield 'd';
                        yield 'r';

                         //вычисле
                        btrpath = btrflies[0].map(item => item.str);
                        
                        //сворачиваем массив
                        btrpath = btrpath.filter((item,i) => {
                            return item !== btrpath[i-1];
                        });
                        

                        debugger;
                        btrpath.shift();
                        index = btrpath.indexOf(current_btr[0].str);
                        btrpath = btrpath.slice(0,index+1);
                        index -= 1; //один ход до
                        counter = 0;

                    } else if (index > -1 && current_btr[0].str === btrpath[index] && counter >= index) {
                        can_move = true;
                        yield 'r';
                        yield 'u';
                        yield 'u';
                        food.shift();
                        btrflies.shift();
                        contacts.shift();
                        index = -1;
                    } else {
                        yield ' ';
                        counter++;
                    }
   
                 }
            } else {
                stage++;
                borders = [];
                counter = 0;
            }

        } else if (stage === 3) {
            food = [];
            for (let e = 0; e < screen.length-1; e++) {
                for (let i = 0; i < screen[e].length; i++) {
                    obj.y = e;
                    obj.x = i;
                    obj.str = `${e}${i}`;
                    obj.up = `${e-1}${i}`;
                    obj.down = `${e+1}${i}`;
                    obj.left = `${e}${i-1}`;
                    obj.right = `${e}${i+1}`;
        
                    if (screen[e][i] === '*') food.push(Object.assign({},obj));
                    else if (screen[e][i] === 'A') {
                        player = Object.assign({},obj);
                    } else if (screen[e][i] === '+' && counter === 1) {
                        borders.push(obj.str);
                    }
                }
            }

            //добавляем свойство == растоянию между игроком и объектом
            food = food.map(a => {
                a.diff = Math.abs(a.x - player.x) + Math.abs(a.y - player.y)
                return a
            });

            //сортируем массив с едой в порядке удалённости объекстов друг от друга
            food.sort((a,b) => {
                return a.diff - b.diff == 0 ? a.y - b.y : a.diff - b.diff;
            });
    
            if (food[0]) {
                diff1 = Math.abs(player.x - food[0].x);
                diff2 = Math.abs(player.y - food[0].y);
                axisX = diff1 >= diff2;
                axisY = diff2 >= diff1;
                history.push(player.str);
                yield move();
                if (food[0].diff === 1) history = [];
            } else {
                return 1;
            }

        }
        counter++;
    }
}