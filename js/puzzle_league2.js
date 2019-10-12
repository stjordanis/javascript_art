
var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
var cursor=document.getElementById('cursor');
var yellow = document.getElementById('yellow');
var blue = document.getElementById('blue');
var red = document.getElementById('red');
var black = document.getElementById('black');
var green = document.getElementById('green');

var pause_button = document.getElementById("pause_button");
pause_button.onclick = pause_func;
var fast_button = document.getElementById("fast_button");
fast_button.onclick = faster_func;


var block_types = [yellow, blue, red, black, green];

var frames_per_row = 50;
var new_row_timer = 0;
var speed = 1;

var board = empty_board();
board[9] = generate_row([0,0,0,0,0,0],[0,0,0,0,0,0]);
board[10] = generate_row([0,0,0,0,0,0],[0,0,0,0,0,0]);
board[11] = generate_row(board[10],board[9]);

var points = 0;
var points_p = document.getElementById("points");


var ManyRows = 12;
var ManyColumns = 6;

var square_size = 50;

var pause = false;

function empty_board() {
    //12 rows, 6 columns
    var r = list_many(6, 0);
    return(list_many(12, r));
};
function list_many(n, r) {
    if(n<1){
        return([]);
    };
    var r2 = JSON.parse(JSON.stringify(r));
    return([r2].concat(list_many(n-1, r)));
};
function valid_row(a, b, c) {
    for(i=0;i<6;i++){
        if ((a[i] == b[i]) && (a[i] == c[i])){
            return(false);
        };
        if ((a[i] == a[i+1]) && (a[i] == a[i+2])){
            return(false);
        };
    };
    return(true);
};
function generate_row(a, b) {
    var Z = [0,0,0,0,0,0].map(function(x){
        var n = Math.floor(Math.random()*5);
        return(n+1);
    });
    var d = valid_row(Z, a, b);
    if (d){
        return(Z);
    };
    return(generate_row(a, b));
}

function match_columns(){
    var X = [];
    for (r=0;r<(ManyRows - 2);r++){
        for(col=0;col<ManyColumns;col++){
            if(!(board[r][col] == 0)) {
                if((board[r][col] == board[r+1][col]) && (board[r][col] == board[r+2][col])){
                    X = X.concat([[r, col],[r+1, col],[r+2, col]]);
                };
            };
        };
    };
    return(X);
};
function match_rows(){
    var X = [];
    for (r=0;r<ManyRows;r++){
        for(col=0;col<(ManyColumns - 2);col++){
            if(!(board[r][col] == 0)) {
                if((board[r][col] == board[r][col+1]) && (board[r][col] == board[r][col+2])){
                    X = X.concat([[r, col],[r,col+1],[r,col+2]]);
                };
            };
        };
    };
    return(X);
};
function is_in(a, L){
    if(L.length == 0){
        return(false);
    };
    if(JSON.stringify(L[0]) == JSON.stringify(a)){
        return(true);
    };
    return(is_in(a, L.slice(1)));
};
function remove_repeats(L){
    if(L.length < 2) {
        return(L);
    };
    var h = L[0];
    var L2 = L.slice(1);
    var b = is_in(h, L2);
    var d;
    if(b){
        d = [];
    } else {
        d = [h]
    };
    return(d.concat(remove_repeats(L2)));
};
function gravity2(R, C) {
    //a single block is falling multiple blocks of height
    if(R==11){//cant fall further than the bottom
        return(0);
    };
    if(!(board[R+1][C] == 0)) {
        return(0);
    };
    board[R+1][C] = board[R][C];
    board[R][C] = 0;
    gravity2(R+1, C);
};
function gravity(R, C) {//only do this if the spot below R,C is empty
    //a stack of blocks falling a height of 1.
    if(R<0){
        return(0);
    };
    if(board[R][C] == 0) {
        return(0);
    };
    board[R+1][C] = board[R][C];
    board[R][C] = 0;
    return(gravity(R-1, C));
};
function remove_spot(R, C) {
    board[R][C] = 0;
    return(gravity(R-1, C));
};
function remove_from_board(L) {
    if(L.length == 0){
        return(0);
    };
    remove_spot(L[0][0], L[0][1]);
    return(remove_from_board(L.slice(1)));
};
function match() {
    //remove any rows or columns from board that match. apply gravity rules to move blocks downwards, and then attempt to match again, with double points this time.
    var r1 = match_columns(board);
    var r2 = match_rows(board);
    var r3 = remove_repeats((r1).concat(r2));
    if (r3.length == 0) {
        return 0;
    };
    remove_from_board(r3);
    var f = r3.length + (2 * match()) - 2;
    return(f);
};
function pause_func() {
    pause = !(pause);
    if(pause){
        clearscreen();
        pause_button.innerHTML = "Resume";
    } else {
        pause_button.innerHTML = "Pause";
    };
};
function faster_func() {
    new_row_timer += frames_per_row;
};
document.addEventListener('keydown', function(event) {
    if(event.keyCode == 90){//z key
        faster_func();
        //new_row_timer += frames_per_row;
    };
    if(event.keyCode == 32){//space bar
        pause_func();
    };
    //console.log(event.keyCode);
});

function draw_board() {
    var a = Math.max(0, new_row_timer/frames_per_row);
    for(columns=0;columns<ManyColumns;columns++){
        for(rows=0;rows<ManyRows;rows++) {
            var x = board[rows][columns];
            if (x == 0) {
            } else if (x == undefined) {
            } else {
                ctx.drawImage(block_types[x-1], square_size*columns, square_size*(1+rows - a));
            }
        };
    };
};

function clearscreen(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.beginPath();
    ctx.rect(0,0,c.width,c.height);
    ctx.fillStyle = '#444444';
    ctx.fill();
};

function mainloop() {
    if(!(pause)) {
        new_row_timer += speed;
        speed *= 1.001;
        if (new_row_timer > frames_per_row) {
            if (JSON.stringify(board[0]) == JSON.stringify([0,0,0,0,0,0])){
                var new_row = generate_row(board[10], board[11]);
                board = board.slice(1).concat([new_row]);
                new_row_timer = 0;
                //console.log("new row");
            } else {
                //console.log(JSON.stringify(board[0]));
                console.log("game over");
                return 0;
            }
        };
        clearscreen();
        draw_board();
    };
    setTimeout(mainloop, 100);//10 frames per second
};
mainloop();


function swap(Y, X) {
    var a = board[Y][X-1];
    var b = board[Y][X];
    board[Y][X-1] = b;
    board[Y][X] = a;
    if(a == 0) {
        gravity(Y-1,X);
    } else if(b == 0) {
        gravity(Y-1, X-1);
    }

    if((Y+1) < 11) {
        gravity2(Y, X);
        gravity2(Y, X-1);
    };
};

document.addEventListener('click', function(e){
    var L = c.offsetLeft;
    var T = c.offsetTop;
    var W = c.width;
    var H = c.height;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    var X = mouseX - L;// - (W/2);
    var a = new_row_timer/frames_per_row;
    var Y = mouseY - T + (a * square_size);// - (H/2);
    Y = Math.floor((Y / square_size)-1);
    X = Math.floor(0.5 + (X / square_size));
    X = Math.min(X, 5);
    X = Math.max(X, 1);
    swap(Y, X);
    var m = match();
    new_row_timer -= ((frames_per_row) * m / 3);
    points += m;
    points_p.innerHTML = "point: ".concat(points);
});

