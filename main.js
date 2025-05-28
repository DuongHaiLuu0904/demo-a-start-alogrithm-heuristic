// ====================================
// MAZE GENERATION VARIABLES AND FUNCTIONS
// ====================================

// Khởi tạo grid chính với kích thước 30x30 và bảng đánh dấu cho việc tạo maze
var grid = {width: 30, height: 30};
var markTable = [];

/**
 * Khởi tạo grid và bảng đánh dấu với tất cả các ô được set về 0 (tường)
 * Grid sẽ được sử dụng để lưu trữ trạng thái của mỗi ô (0 = tường, 1 = đường đi)
 * MarkTable được sử dụng trong quá trình tạo maze để theo dõi các ô đã được xử lý
 */
function gridInitialize(){
	for(var i = 0 ; i < grid.height ; i ++){
		var row = [];
		var mark = [];
		for(var j = 0 ; j < grid.width ; j ++){
			row.push(0);
			mark.push(false);
		}
		grid[i] = row;
		markTable.push(mark);
	}
}

/**
 * Kiểm tra xem tọa độ (x, y) có nằm trong phạm vi của grid hay không
 * @param {number} x - Tọa độ x cần kiểm tra
 * @param {number} y - Tọa độ y cần kiểm tra
 * @returns {boolean} - True nếu tọa độ nằm trong grid, false nếu ngoài phạm vi
 */
function isInsideGrid(x, y){
    if(x > -1 && x < grid.width && y > -1 && y < grid.height){
        return true;
    }
    else{
        return false;
    }
}

/**
 * Kiểm tra xem có thể tạo đường nối giữa hai ô trong quá trình tạo maze không
 * Điều kiện: cả hai ô chưa được đánh dấu và ô giữa chúng cũng chưa được đánh dấu
 * @param {object} root - Ô gốc {x, y}
 * @param {object} cell - Ô đích {x, y}
 * @returns {boolean} - True nếu có thể tạo đường nối, false nếu không thể
 */
function check(root, cell){
	var first = !markTable[cell.x][cell.y];
	var second = !markTable[Math.floor((root.x + cell.x) / 2)][Math.floor((root.y + cell.y) / 2)];

	return (first && second);
}

/**
 * Phá bỏ tường giữa hai ô và tạo đường đi trong quá trình tạo maze
 * Đánh dấu cả hai ô và ô ở giữa là đã được xử lý, đồng thời set giá trị của chúng thành 1 (đường đi)
 * @param {object} root - Ô gốc {x, y}
 * @param {object} cell - Ô đích {x, y}
 */
function destroyWall(root, cell){
	markTable[cell.x][cell.y] = true;
	markTable[Math.floor((root.x + cell.x) / 2)][Math.floor((root.y + cell.y) / 2)] = true;
	grid[cell.x][cell.y] = 1;
	grid[Math.floor((root.x + cell.x) / 2)][Math.floor((root.y + cell.y) / 2)] = 1;
}

/**
 * Tạo thêm các lỗ ngẫu nhiên trong maze để tăng tính đa dạng đường đi
 * Duyệt qua tất cả các ô là tường (giá trị 0) và có xác suất nhất định để biến thành đường đi
 * @param {number} probability - Xác suất tạo lỗ (0-100)
 */
function drill(probability){
	for(var i = 0 ; i < grid.height ; i ++){
		for(var j = 0 ; j < grid.width ; j ++){
			if(grid[i][j] == 0){
				var rand = Math.floor(Math.random() * 100) / (100 - probability);
				if(rand > 1){
					grid[i][j] = 1;
				}
			}
		}
	}
}

/**
 * Thuật toán tạo maze sử dụng phương pháp Depth-First Search (DFS)
 * Bắt đầu từ một điểm ngẫu nhiên và sử dụng stack để duyệt và tạo đường đi
 * Sử dụng backtracking để đảm bảo tất cả các vùng có thể đến được
 */
function generator(){
	var randomIndexSource = Math.floor(Math.random() * 3);
	var stack = [];

	// Bắt đầu từ điểm ngẫu nhiên ở cạnh trái
	stack.push({x: 0, y: randomIndexSource});
	while(stack.length > 0){
		var node = stack.pop();
		// Tìm các ô lân cận cách 2 đơn vị (để tránh tạo đường đi quá rộng)
		var gcandidate = [{x:node.x, y:node.y - 2}, 
						 {x:node.x - 2, y:node.y}, 
						 {x:node.x + 2, y:node.y},  
						 {x:node.x, y:node.y + 2}]
		var neighbors = []
		// Kiểm tra các ô lân cận hợp lệ
		for(var i = 0 ; i < gcandidate.length ; i ++){
			if(isInsideGrid(gcandidate[i].x, gcandidate[i].y) && check(node, gcandidate[i])){
				neighbors.push(gcandidate[i]);
			}
		}
		// Xử lý ngẫu nhiên các neighbor để tạo tính đa dạng
		while(neighbors.length > 0){
			var randomIndex = Math.floor(Math.random() * neighbors.length);
			var neighbor = neighbors.splice(randomIndex, 1)[0];
			var probability = Math.floor(Math.random() * 100) / 30;
			if(probability > 1){
				destroyWall(node, neighbor);
				stack.push(neighbor);
			}
		}
	}
	// Tạo thêm các lỗ ngẫu nhiên với xác suất 70%
	drill(70);
}

/**
 * Hàm chính để tạo maze mới
 * Khởi tạo grid và gọi generator để tạo cấu trúc maze
 */
function mazeGenerating(){
    gridInitialize();
    generator();
}



// ====================================
// A* ALGORITHM IMPLEMENTATION
// ====================================

/**
 * Tính khoảng cách Euclidean giữa hai điểm
 * @param {object} a - Điểm thứ nhất {x, y}
 * @param {object} b - Điểm thứ hai {x, y}
 * @returns {number} - Khoảng cách Euclidean giữa hai điểm
 */
function distance(a, b){
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
}

/**
 * Lớp Cell đại diện cho một ô trong grid với các thuộc tính cần thiết cho thuật toán A*
 * Mỗi ô lưu trữ tọa độ, cha, chi phí g, giá trị f và trạng thái đã xét
 */
class cell{
    constructor(x, y, parent, g){
        this.x = x;               // Tọa độ x của ô
        this.y = y;               // Tọa độ y của ô
        this.parent = parent;     // Ô cha trong đường đi
        this.isConsidered = false; // Đã được xem xét chưa
        this.g = g;               // Chi phí từ điểm xuất phát đến ô này
    }

    /**
     * Tính toán giá trị f = g + h cho ô hiện tại dựa trên hàm heuristic được chọn
     * @param {object} destination - Điểm đích {x, y}
     * @param {object} source - Điểm xuất phát {x, y}
     * @param {string} index - Chỉ số hàm heuristic được chọn (1-7)
     */
    evaluateFValue(destination, source, index){
        switch(index){
            case "1":{
                this.f = this.g + this.heuristic1(destination, source);
                console.log(1);
                break;
            }
            case "2":{
                this.f = this.g + this.heuristic2(destination, source);
                console.log(2);
                break;
            }
            case "3":{
                this.f = this.g + this.heuristic3(destination, source);
                console.log(3);
                break;
            }
            case "4":{
                this.f = this.g + this.heuristic4(destination, source);
                console.log(4);
                break;
            }
            case "5":{
                this.f = this.g + this.heuristic5(destination, source);
                console.log(5);
                break;
            }
            case "6":{
                this.f = this.g + this.heuristic6(destination, source);
                console.log(6);
                break;
            }
            case "7":{
                this.f = this.g + this.heuristic7(destination, source);
                console.log(7);
                break;
            }
            default:{
                this.f = this.g + this.heuristic1(destination, source);
                console.log(8);
                break;
            }
        }
        
    }

    /**
     * Heuristic 1: Khoảng cách Euclidean (đường thẳng): √((x₁-x₂)² + (y₁-y₂)²) 
     * Ước lượng chính xác nhất cho đường đi thực tế - chính xác nhất
     */
    heuristic1(destination, source){
        return distance(this, destination)
    }

    /**
     * Heuristic 2: Bình phương khoảng cách Euclidean (không lấy căn): (x₁-x₂)² + (y₁-y₂)²
     * Nhanh hơn heuristic1 nhưng có thể ước lượng không chính xác 
     */
    heuristic2(destination, source){
        return Math.floor(distance(this, destination) ** 2)
    }

    /**
     * Heuristic 3: Khoảng cách Chebyshev: max(|x₁-x₂|, |y₁-y₂|)
     * Phù hợp khi cho phép di chuyển chéo với chi phí bằng nhau
     */
    heuristic3(destination, source){
        return Math.max(Math.abs(destination.x - this.x), Math.abs(destination.y - this.y));

    }

    /**
     * Heuristic 4: Khoảng cách Manhattan: |x₁-x₂| + |y₁-y₂|
     * Phù hợp khi chỉ cho phép di chuyển theo 4 hướng (không chéo)
     */
    heuristic4(destination, source){
        return Math.abs(this.x - destination.x) + Math.abs(this.y - destination.y);
    }

    /**
     * Heuristic 5: Khoảng cách Octile = Heuristic3 + Heuristic4
     * Kết hợp Manhattan và Chebyshev, phù hợp cho grid cho phép đi chéo
     */
    heuristic5(destination, source){
        var dx = Math.abs(destination.x - this.x);
        var dy = Math.abs(destination.y - this.y);
        return dx > dy ? dx + sqrt(2) * dy : sqrt(2) * dx + dy
    }

    /**
     * Heuristic 6: Tie-Breaking
     * Cải thiện heuristic2 bằng cách thêm hệ số phá vỡ tie để tránh nhiều đường có cùng f-value
     */
    heuristic6(destination, source){
        var dx1 = this.x - destination.x;
        var dy1 = this.y - destination.y;
        var dx2 = source.x - destination.x;
        var dy2 = source.y - destination.y;
        return Math.abs(dx1 * dy2 - dx2 * dy1) * 0.001 + this.heuristic2(destination, source);
    }

    /**
     * Heuristic 7: Angle Euclidean
     * Sử dụng góc và khoảng cách để ước lượng, ưu tiên đường đi thẳng hơn
     */
    heuristic7(destination, source){
        var CS = distance(this, source);
        var CD = distance(this, destination);
        var SD = distance(source, destination);
        var c =  -Math.abs(((CS**2 + SD**2 - CD**2) / (2 * CS * SD)));
        return this.heuristic2(destination, source) + c;
    }
}

// ====================================
// GLOBAL VARIABLES FOR A* ALGORITHM
// ====================================

var gridDetail = [];      // Ma trận chứa chi tiết các ô (đối tượng cell)
var openList = [];        // Danh sách các ô đang chờ xét (priority queue)
var closeList = [];       // Danh sách các ô đã xét xong

var pickedS = false;      // Đã chọn điểm xuất phát chưa
var pickedD = false;      // Đã chọn điểm đích chưa
var source = null;        // Điểm xuất phát
var destination = null;   // Điểm đích

var considered = [];      // Danh sách các ô đã được xem xét để vẽ
var cellConsidered = 0;   // Số ô đã xem xét
var result = null;        // Kết quả đường đi tìm được
var hasPath = false;      // Có tìm được đường đi không

/**
 * Khởi tạo ma trận gridDetail với các đối tượng cell
 * Mỗi ô trong grid sẽ có một đối tượng cell tương ứng chứa thông tin chi tiết
 */
function initialize(){
    for(var i = 0 ; i < grid.height ; i ++){
        var row = []
        for(var j = 0 ; j < grid.width ; j ++){
            var cellDetail = new cell(i, j, null, null);
            row.push(cellDetail)
        }
        gridDetail.push(row);
    }
}





/**
 * Kiểm tra xem tọa độ (x, y) có trùng với node cho trước không
 * @param {number} x - Tọa độ x cần kiểm tra
 * @param {number} y - Tọa độ y cần kiểm tra  
 * @param {object} node - Node cần so sánh {x, y}
 * @returns {boolean} - True nếu trùng tọa độ, false nếu khác
 */
function isNode(x, y, node){
    return (x === node.x && y === node.y);
}





/**
 * Kiểm tra xem ô tại tọa độ (x, y) có phải là tường không
 * @param {number} x - Tọa độ x cần kiểm tra
 * @param {number} y - Tọa độ y cần kiểm tra
 * @returns {boolean} - True nếu là tường (giá trị 0), false nếu là đường đi (giá trị 1)
 */
function isWall(x, y){
    return (grid[x][y] === 0);
}






/**
 * Kiểm tra xem tọa độ (x, y) có nằm trong phạm vi của grid hay không
 * Hàm này được định nghĩa lại để sử dụng trong thuật toán A*
 * @param {number} x - Tọa độ x cần kiểm tra
 * @param {number} y - Tọa độ y cần kiểm tra
 * @returns {boolean} - True nếu tọa độ nằm trong grid, false nếu ngoài phạm vi
 */
function isInsideGrid(x, y){
    return (x > -1 && x < grid.width && y > -1 && y < grid.height);
}





/**
 * Truy vết đường đi từ điểm đích về điểm xuất phát thông qua các parent
 * Sử dụng khi đã tìm được đường đi để tạo ra mảng các ô trong đường đi
 * @returns {Array} - Mảng các ô trong đường đi từ đích về nguồn
 */
function pathTracing(){
    var temp_x = gridDetail[destination.x][destination.y].parent.x;
    var temp_y = gridDetail[destination.x][destination.y].parent.y;

    var path = [];
    path.push({x: destination.x, y: destination.y});

    // Truy vết ngược từ đích về nguồn qua các parent
    while(temp_x !== source.x || temp_y !== source.y){
        var parent = gridDetail[temp_x][temp_y]

        temp_x = parent.parent.x;
        temp_y = parent.parent.y;
        path.push({x: parent.x, y: parent.y});
    }
    path.push({x: source.x, y: source.y});

    return path;
}





/**
 * Tìm kiếm ô có cùng tọa độ trong danh sách cho trước
 * @param {object} cell - Ô cần tìm {x, y}
 * @param {Array} list - Danh sách cần tìm kiếm
 * @returns {object|null} - {cell: ô tìm thấy, index: vị trí} hoặc null nếu không tìm thấy
 */
function samePositionInList(cell, list){
    for(var i = 0 ; i < list.length ; i ++){
        if(list[i].x == cell.x && list[i].y == cell.y){
            return {cell:list[i], index:i};
        }
    }
    return null;
}





/**
 * Chèn ô vào openList theo thứ tự f-value tăng dần (priority queue)
 * Đảm bảo openList luôn được sắp xếp để lấy ô có f-value nhỏ nhất
 * @param {object} cell - Ô cần chèn vào openList
 */
function insertIntoOpenList(cell){
    var i = 0;
    // Tìm vị trí chèn phù hợp để duy trì thứ tự tăng dần của f-value
    while(i < openList.length && openList[i].f < cell.f){
        i ++;
    }

    // Chèn vào vị trí phù hợp để duy trì thứ tự
    if(i === openList.length){
        openList.push(cell);
    } else {
        openList.splice(i, 0, cell);
    }
}




/**
 * Cập nhật vị trí của ô trong openList sau khi f-value thay đổi
 * Xóa ô tại vị trí cũ và chèn lại vào vị trí mới phù hợp
 * @param {number} index - Vị trí cũ của ô trong openList
 * @param {object} cell - Ô cần cập nhật
 */
function updateOpenList(index, cell){
    openList.splice(index, 1);
    insertIntoOpenList(cell);
}




/**
 * Cập nhật thông tin của ô với parent, g-value mới và tính lại f-value
 * @param {number} x - Tọa độ x của ô
 * @param {number} y - Tọa độ y của ô
 * @param {object} parent - Ô cha mới
 * @param {number} g - Giá trị g mới
 * @param {string} index - Chỉ số hàm heuristic
 */
function updateCell(x, y, parent, g, index){
    gridDetail[x][y].parent = parent;
    gridDetail[x][y].g = g;
    gridDetail[x][y].evaluateFValue(destination, source, index);
}




/**
 * Kiểm tra tính hợp lệ của grid trước khi chạy thuật toán A*
 * @returns {boolean} - True nếu grid hợp lệ (điểm xuất phát và đích khác nhau, không phải tường, nằm trong grid)
 */
function checkGrid(){
    return !(isNode(source.x, source.y, destination) || isWall(source.x, source.y) || isWall(destination.x, destination.y) || !isInsideGrid(source.x, source.y) || !isInsideGrid(destination.x, destination.y))
}




/**
 * Tính toán tổng chi phí của đường đi tìm được
 * @param {Array} result - Mảng các ô trong đường đi
 * @returns {number} - Tổng khoảng cách Euclidean của đường đi
 */
function cost(result){
    var c = 0;
    for(var i = 1 ; i < result.length ; i ++){
        c += distance(result[i], result[i - 1]);
    }
    return c;
}





/**
 * Thuật toán A* chính để tìm đường đi tối ưu từ điểm xuất phát đến đích
 * Sử dụng open list (priority queue) và close list để quản lý các ô
 * @returns {Array|null} - Mảng các ô trong đường đi tối ưu hoặc null nếu không tìm thấy
 */
function AStarAlgorithm(){
    initialize();
    if(!checkGrid()) return null;
    var index = $('input[name="heuristic"]:checked').val();

    insertIntoOpenList(gridDetail[source.x][source.y]);
    while(openList.length > 0){
        var current = openList.shift();
        cellConsidered ++;
        gridDetail[current.x][current.y].isConsidered = true;
        
        // Kiểm tra đích 
        if(isNode(current.x, current.y, destination)){
            hasPath = true;
            return pathTracing();
        }

        // Tạo danh sách các ô lân cận
        var candidate = [{x:current.x, y:current.y - 1}, 
                        {x:current.x - 1, y:current.y}, 
                        {x:current.x + 1, y:current.y},  
                        {x:current.x, y:current.y + 1}]
        
        // Nếu cho phép di chuyển chéo, thêm các ô chéo vào danh sách
        if($('input[name=diagonal]:checked').val() == "allowdiagonal"){
            candidate.push({x:current.x - 1, y:current.y - 1})
            candidate.push({x:current.x - 1, y:current.y + 1})
            candidate.push({x:current.x + 1, y:current.y - 1})  
            candidate.push({x:current.x + 1, y:current.y + 1})
        }

        var neighbors = [];
        for(let i = 0 ; i < candidate.length ; i ++){
            if(isInsideGrid(candidate[i].x, candidate[i].y) && !isWall(candidate[i].x, candidate[i].y)){
                neighbors.push(candidate[i]);
                if(!samePositionInList(candidate[i], considered)) considered.push({x : candidate[i].x, y : candidate[i].y})
            }
        }

        neighbors.forEach(successor => {
            var scDist = current.g + distance(successor, current);

            var samePositionO = samePositionInList(successor, openList);
            var samePositionC = samePositionInList(successor, closeList);
            
            // Kiểm tra và cập nhật nếu tìm được đường đi tốt hơn
            if(samePositionO !== null){
                if(samePositionO.cell.g > scDist){
                    updateCell(successor.x, successor.y, current, scDist, index)
                    updateOpenList(samePositionO.index, gridDetail[successor.x][successor.y]);
                }
            } else if(samePositionC !== null){
                if(samePositionC.cell.g > scDist){
                    updateCell(successor.x, successor.y, current, scDist, index)
                    closeList.splice(samePositionC.index, 1);
                    insertIntoOpenList(gridDetail[successor.x][successor.y])
                }
            } else {
                updateCell(successor.x, successor.y, current, scDist, index)
                insertIntoOpenList(gridDetail[successor.x][successor.y]);
            }
        })
        closeList.push(current);
    }
    return null;
}

/**
 * Hàm thực hiện tìm kiếm đường đi bằng thuật toán A*
 * Gọi AStarAlgorithm() và lưu kết quả vào biến result
 */
function search(){
    result = AStarAlgorithm();
}







// ====================================
// UI CREATION AND CANVAS FUNCTIONS
// ====================================

// Biến toàn cục cho kích thước canvas và chế độ hoạt động
var gwidth = 600;           // Chiều rộng canvas mặc định
var gheight = 600;          // Chiều cao canvas mặc định
var cellWidth = 20;         // Chiều rộng mỗi ô trong grid
var cellHeight = 20;        // Chiều cao mỗi ô trong grid
var allowToRun = false;     // Cho phép chạy thuật toán hay không
var createMaze = false;     // Chế độ tạo maze tùy chỉnh
var selectSD = true;        // Chế độ chọn điểm xuất phát và đích

/**
 * Tính toán kích thước canvas responsive dựa trên kích thước container
 * Canvas sẽ tự động điều chỉnh để phù hợp với màn hình và tăng 30% kích thước
 * @returns {object} - {canvasSize: kích thước canvas, cellSize: kích thước từng ô}
 */
function calculateCanvasSize(){
    // Lấy kích thước container
    var container = document.getElementById('sketch-holder');
    var containerWidth = container.clientWidth - 50; // Trừ padding
    var containerHeight = window.innerHeight - 250; // Trừ header và padding
    
    // Đảm bảo canvas vuông và phù hợp với container
    var maxSize = Math.min(containerWidth, containerHeight);
    
    // Tăng kích thước lên 30%
    maxSize = Math.floor(maxSize * 1.4);
    
    maxSize = Math.min(maxSize, 900); // Giới hạn tối đa cao hơn
    maxSize = Math.max(maxSize, 500); // Giới hạn tối thiểu cao hơn
    
    // Tính toán cell size để fit với grid 30x30
    var newCellSize = Math.floor(maxSize / 30);
    
    return {
        canvasSize: newCellSize * 30,
        cellSize: newCellSize
    };
}

/**
 * Vẽ toàn bộ grid với màu sắc tương ứng cho từng ô
 * Ô tường (giá trị 0) được vẽ màu đen, ô đường đi (giá trị 1) được vẽ màu trắng
 */
function drawGrid(){
    for(var i = 0 ; i < grid.width ; i ++){
        for(var j = 0 ; j < grid.height ; j ++){
            fill(grid[i][j] == 1 ? 255 : 0);
            rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
}

/**
 * Hàm setup của p5.js - được gọi một lần khi khởi động
 * Tạo maze mới, reset trạng thái và khởi tạo canvas với kích thước responsive
 */
function setup(){
    mazeGenerating();
    pickedS = false;
    pickedD = false;
    
    // Tính toán kích thước canvas responsive
    var sizes = calculateCanvasSize();
    gwidth = sizes.canvasSize;
    gheight = sizes.canvasSize;
    cellWidth = sizes.cellSize;
    cellHeight = sizes.cellSize;
    
    var canvas = createCanvas(gwidth, gheight);
    canvas.parent('sketch-holder');
    drawGrid();
}

/**
 * Hàm xử lý sự kiện kéo chuột - được gọi khi người dùng kéo chuột
 * Trong chế độ tạo maze, cho phép vẽ tường bằng cách kéo chuột
 */
function mouseDragged(){
    if(createMaze){
        var i = Math.floor(mouseX / cellWidth);
        var j = Math.floor(mouseY / cellWidth);
        grid[i][j] = 0;
        fill(0);
        rect(Math.floor(mouseX / cellWidth) * cellWidth, Math.floor(mouseY / cellWidth) * cellHeight, cellWidth, cellHeight)
    }
}

/**
 * Hàm xử lý sự kiện nhấn chuột - được gọi khi người dùng nhấn chuột
 * Xử lý logic chọn điểm xuất phát/đích hoặc tạo tường tùy theo chế độ hiện tại
 * - Chế độ selectSD: chọn điểm xuất phát và đích, sau đó chạy thuật toán A*
 * - Chế độ createMaze: tạo tường tại vị trí nhấn chuột
 */
function mousePressed(){
    var x = Math.floor(mouseX / cellWidth);
    var y = Math.floor(mouseY / cellHeight);
    if(selectSD){
        if(isInsideGrid(x, y) && !isWall(x, y)){    
            if(pickedS){
                if(pickedD){
                    pickedD = false;
                    considered = [];
                    openList = [];
                    closeList = []
                    gridDetail = [];
                    result = [];
                    cellConsidered = 0;
                    indexConsidered = 0;
                    drawGrid()
                    source = {x, y};
                    fill(255, 0, 0);
                    rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight)

                } else{
                    if(x == source.x && y == source.y){
                        alert("Diem xuat phat va diem dich trung nhau")
                    } else{
                        destination = {x: x, y: y};
                        fill(230, 0, 172);
                        rect(destination.x * cellWidth, destination.y * cellHeight, cellWidth, cellHeight)
                        pickedD = true;

                        search();
                        $("#result").text(result.length);
                        $("#considered").text(cellConsidered);
                        $("#cost").text(Math.floor(cost(result) * 1000) / 1000);
                        loop();
                    }
                } 
            } else{
                source = {x, y};
                fill(255, 0, 0);
                rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight)
                pickedS = true;
            }
        }
    } else if(createMaze){
        grid[x][y] = 0;
        fill(0);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
    }
}

// Biến điều khiển animation và tốc độ vẽ
var indexConsidered = 0;        // Chỉ số ô hiện tại đang được vẽ trong animation
var drawSpeed = 50;             // Tốc độ vẽ mặc định (frames per second)

/**
 * Hàm draw của p5.js - được gọi liên tục để tạo animation
 * Hiển thị quá trình tìm kiếm A* từng bước một:
 * 1. Vẽ các ô đã được xem xét (màu vàng cho open list, màu cam cho close list)
 * 2. Vẽ đường đi tối ưu tìm được (màu xanh lá)
 * 3. Vẽ lại điểm xuất phát (đỏ) và đích (hồng)
 */
function draw(){
    frameRate(drawSpeed);
    if(source == null || destination == null){
        noLoop();
    } else{
        if(considered[indexConsidered]){
            var node = considered[indexConsidered];
            if(!isNode(node.x, node.y, source) && !isNode(node.x, node.y, destination)){
                if(gridDetail[node.x][node.y].isConsidered){
                    fill(255, 119, 51)
                } else{
                    fill(255, 255, 77)
                }
                rect(considered[indexConsidered].x * cellWidth, considered[indexConsidered].y * cellHeight, cellWidth, cellHeight);
            }
            indexConsidered ++;
        } else{
            result.shift();
            for(var i = 0 ; i < result.length ; i ++){
                fill(0, 255, 0)
                rect(result[i].x * cellWidth, result[i].y * cellHeight, cellWidth, cellHeight);
            }
            fill(230, 0, 172)
            rect(destination.x * cellWidth, destination.y * cellHeight, cellWidth, cellHeight);
            fill(255, 0, 0)
            rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight);

            noLoop();
        }
    }
}




// ====================================
// EVENT HANDLERS VÀ UI CONTROLS
// ====================================

/**
 * Xử lý sự kiện nhấn nút Reload - tải lại trang web hoàn toàn
 */
$("#reload").on("click", function(){
    location.reload();
})

/**
 * Xử lý sự kiện thay đổi slider tốc độ vẽ
 * Cập nhật tốc độ animation và hiển thị giá trị hiện tại
 */
$("#speed-slider").on("input", function(){
    drawSpeed = parseInt($(this).val());
    $("#speed-value").text(drawSpeed);
})

/**
 * Xử lý sự kiện thay đổi kích thước cửa sổ để canvas responsive
 * Tính toán lại kích thước canvas và vẽ lại toàn bộ grid
 */
$(window).on("resize", function(){
    var sizes = calculateCanvasSize();
    if(sizes.canvasSize !== gwidth) {
        gwidth = sizes.canvasSize;
        gheight = sizes.canvasSize;
        cellWidth = sizes.cellSize;
        cellHeight = sizes.cellSize;
        
        resizeCanvas(gwidth, gheight);
        drawGrid();
        
        // Vẽ lại source và destination nếu đã được chọn
        if(source) {
            fill(255, 0, 0);
            rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight);
        }
        if(destination) {
            fill(230, 0, 172);
            rect(destination.x * cellWidth, destination.y * cellHeight, cellWidth, cellHeight);
        }
    }
})

/**
 * Chuyển sang chế độ tạo maze tùy chỉnh
 * Cho phép người dùng vẽ tường bằng cách nhấn và kéo chuột
 */
$("#createMaze").on("click", function(){
    createMaze = true;
    selectSD = false;
    $("#mode").text("Customize the maze")
})

/**
 * Chuyển sang chế độ chọn điểm xuất phát và đích
 * Cho phép người dùng chọn hai điểm để chạy thuật toán A*
 */
$("#selectSD").on("click", function(){
    createMaze = false;
    selectSD = true;
    $("#mode").text("Select source and destination")
})

/**
 * Xóa toàn bộ maze và tạo một không gian trống (tất cả đều là đường đi)
 * Hữu ích để bắt đầu tạo maze từ đầu
 */
$("#clearMaze").on("click", function(){
    for(var i = 0 ; i < grid.width ; i ++){
        for(var j = 0 ; j < grid.height ; j ++){
            grid[i][j] = 1;
            fill(255);
            rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
})
