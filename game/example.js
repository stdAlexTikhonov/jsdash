'use strict'; /*jslint node:true*/

function find_player(screen){
    for (let y = 0; y<screen.length; y++)
    {
        let row = screen[y];
        for (let x = 0; x<row.length; x++)
        {
            if (row[x]=='A')
                return { y, x };
        }
    }
}

function find_star(screen){
  let k = 0, j = 0;
    for (k = 0; k<screen.length; k++)
    {
        let row = screen[k];
        for (j = 0; j<row.length; j++)
        {
            if (row[j]=='*')
                return {j, k};
        }
    }
    k = -1;
    j = -1;
    return { j, k };
}


function find_butterfly(screen) {
  let n = 0, m = 0;
  for ( n = 0; n < screen.length; n++ ) {
    let row = screen[n];
    for ( m = 0; m < row.length; m++ ) {
      if ( '/|\\-'.includes(row[m]) )
        return { n, m };
    }
  }
  n = -1;
  m = -1;
  return { n, m };
}

exports.play = function*(screen){
    let move = 'u';
    while (true){
        let {x, y} = find_player(screen);
        
        // if (' :*'.includes(screen[y-1][x]))
        //     moves += 'u';
        // if (' :*'.includes(screen[y+1][x]))
        //     moves += 'd';
        // if (' :*'.includes(screen[y][x+1])
        //     || screen[y][x+1]=='O' && screen[y][x+2]==' ')
        // {
        //     moves += 'r';
        // }
        // if (' :*'.includes(screen[y][x-1])
        //     || screen[y][x-1]=='O' && screen[y][x-2]==' ')
        // {
        //     moves += 'l';
        // }
        // yield moves[Math.floor(Math.random()*moves.length)];
        console.log(screen);
        debugger;
        if (screen[y][x-1] == ' ') {
            if (move == 'r') { 
                move = 'r'; 
                if (screen[y][x+1] != ' ') move = 'd';
            } else if (move == 'd')  { 
                move = 'd';
                if (screen[y][x-1] != ' ') move = 'l';
            }
            else move = 'l';
        }
        else if (screen[y-1][x] == ' ') {
            if (move == 'd') move = 'd';
            else move = 'u'; 
        }
        else if (screen[y][x+1] == ' ') {
            move = 'r';
        }
        else if (screen[y+1][x] == ' ') {
            move = 'd';
        }
        else move = ''
        yield move;
    }
};
