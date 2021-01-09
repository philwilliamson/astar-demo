document.addEventListener('DOMContentLoaded', () => {

    let canvas = document.getElementById('canvas');

    class TileGrid {
        constructor(width, height, tile_width){
            this.width = width;
            this.height = height;
            this.tile_border_width = 1; //change as needed
            this.tile_width = tile_width-2*this.tile_border_width;
            this.tile_ids = [];
            for (let i = 0; i < width*height; i++){
                this.tile_ids.push('tile-'+(i).toString());
            }
            console.log('A Grid object was created.');
            console.log(this.tile_ids);
            this.draw();
        }

        draw(){
            //create and insert grid in DOM
            
            let grid_to_insert = document.createElement('div');
            grid_to_insert.classList.add('grid');
            //format and append grid
            grid_to_insert.style.width = (this.width*(this.tile_width+2*this.tile_border_width)).toString()+'px';
            grid_to_insert.style.height = (this.height*(this.tile_width+2*this.tile_border_width)).toString()+'px';
            
            //append tiles
            for (let index=0; index < this.width*this.height; index++){
                let tile_to_insert = document.createElement('a');
                tile_to_insert.href = "#";
                tile_to_insert.id = this.tile_ids[index];
                tile_to_insert.style.borderWidth = (this.tile_border_width).toString()+'px';
                tile_to_insert.style.width = (this.tile_width).toString()+'px';
                tile_to_insert.style.height = (this.tile_width).toString()+'px';;
                tile_to_insert.classList.add('tile');
                tile_to_insert.classList.add('clear');
                //click functionality
                tile_to_insert.addEventListener('click', changeTileType);
                grid_to_insert.appendChild(tile_to_insert);
            }
           canvas.appendChild(grid_to_insert);
        }    
    }

    class Node{
        constructor(tile_element, goal_element, g_score, came_from_id = null){
            this.node_tile_element = tile_element;
            this.node_id = tileNumber(tile_element);
            this.node_coords = tileCoords(tile_element);
            
            this.goal_element = goal_element;
            this.goal_id = tileNumber(goal_element);
            this.goal_coords = tileCoords(goal_element);

            this.g_score = g_score;
            this.h_score = euclidianHeuristic(this.node_coords, this.goal_coords);
            this.f_score = this.g_score + this.h_score;
            this.came_from_id = came_from_id;
        }

        update_g_score(new_g_score){
            this.g_score = new_g_score;
            this.update_f_score();
        }
        
        update_h_score(){
            this.h_score = euclidianHeuristic(this.node_coords, this.goal_coords);
        }

        update_f_score(){
            this.f_score = this.g_score + this.h_score;
        }

        update_came_from_id(new_came_from_id){
            this.came_from_id = new_came_from_id;
        }

        get_neighbor_ids(){
            
            let neighbor_list = [];
			
			let node_above_id = null;
			let node_right_id = null;
			let node_below_id = null;
			let node_left_id = null;
			
			let node_aboveleft_id = null;
			let node_aboveright_id = null;
			let node_belowright_id = null;
			let node_belowleft_id = null;
			
			//Add nodes above, below, and adjacent

			//Add node above to neighbor list if not blocked and this node not on top edge
			if (this.node_coords[0] != 0){
				node_above_id = this.node_id - grid.width;
				if (!(tileElement(node_above_id).classList.contains('blocked'))){
					neighbor_list.push(node_above_id);
				}
			}
			
			//Add node to right to neighbor list if not blocked and this node not on right edge
			if (this.node_coords[1] != grid.width - 1){
				node_right_id = this.node_id + 1;
				if (!(tileElement(node_right_id).classList.contains('blocked'))){
					neighbor_list.push(node_right_id);
				}
			}
			
			//Add node to below to neighbor list if not blocked and this node not on bottom edge
			if (this.node_coords[0] != grid.height - 1){
				node_below_id = this.node_id + grid.width;
				if (!(tileElement(node_below_id).classList.contains('blocked'))){
					neighbor_list.push(node_below_id);
				}
			}
			
			//Add node to left to neighbor list if not blocked and this node not on left edge
			if (this.node_coords[1] != 0){
				node_left_id = this.node_id - 1;
				if (!(tileElement(node_left_id).classList.contains('blocked'))){
					neighbor_list.push(node_left_id);
				}
			}

			//Check and add diagonal nodes
			//Check above left node
			if (neighbor_list.includes(node_above_id) && neighbor_list.includes(node_left_id)){
				node_aboveleft_id = node_above_id - 1
				if (!(tileElement(node_aboveleft_id).classList.contains('blocked'))){
					neighbor_list.push(node_aboveleft_id);
				}
				
			}
			
			//Check above right node
			if (neighbor_list.includes(node_above_id) && neighbor_list.includes(node_right_id)){
				node_aboveright_id = node_above_id + 1
				if (!(tileElement(node_aboveright_id).classList.contains('blocked'))){
					neighbor_list.push(node_aboveright_id);
				}
				
			}
			
			//Check below right node
			if (neighbor_list.includes(node_below_id) && neighbor_list.includes(node_right_id)){
				node_belowright_id = node_below_id + 1
				if (!(tileElement(node_belowright_id).classList.contains('blocked'))){
					neighbor_list.push(node_belowright_id);
				}
				
			}
			
			//Check below left node
			if (neighbor_list.includes(node_below_id) && neighbor_list.includes(node_left_id)){
				node_belowleft_id = node_below_id - 1
				if (!(tileElement(node_belowleft_id).classList.contains('blocked'))){
					neighbor_list.push(node_belowleft_id);
				}
				
			}
            

            return neighbor_list;
        }
    }

    class NodeList{
        constructor(tile_list){
            if (tile_list == null){
                this.list = [];
            } else {
                this.list = tile_list;
            }
        }

        append(new_node){
            this.list.push(new_node);
        }

        //use merge sort to sort list
        sort_by_f_score(){
            if (this.list.length > 1){
                
                let middle_index = Math.floor(this.list.length / 2);
                let left_array = new NodeList(this.list.slice(0, middle_index));
                let right_array = new NodeList(this.list.slice(middle_index));
                left_array.sort_by_f_score();
                right_array.sort_by_f_score();

                let working_array = [];

                while (left_array.list.length > 0 && right_array.list.length > 0){
                    if (left_array.list[0].f_score < right_array.list[0].f_score){
                        working_array.push(left_array.list.shift());
                    } else {
                        working_array.push(right_array.list.shift());
                    }
                }

                let sorted_array = [];

                if (left_array.list.length > 0){
                    sorted_array = working_array.concat(left_array.list);
                } else if (right_array.list.length > 0){
                    sorted_array = working_array.concat(right_array.list);
                }

                this.list = sorted_array;
            } 
        }

        sort_by_id(){
            if (this.list.length > 1){
                
                let middle_index = Math.floor(this.list.length / 2);
                let left_array = new NodeList(this.list.slice(0, middle_index));
                let right_array = new NodeList(this.list.slice(middle_index));
                left_array.sort_by_id();
                right_array.sort_by_id();

                let working_array = [];

                while (left_array.list.length > 0 && right_array.list.length > 0){
                    if (left_array.list[0].node_id < right_array.list[0].node_id){
                        working_array.push(left_array.list.shift());
                    } else {
                        working_array.push(right_array.list.shift());
                    }
                }

                let sorted_array = [];

                if (left_array.list.length > 0){
                    sorted_array = working_array.concat(left_array.list);
                } else if (right_array.list.length > 0){
                    sorted_array = working_array.concat(right_array.list);
                }

                this.list = sorted_array;
            } 
        }

        //binary search for node in node list
        contains_node(search_node){
            
            if (this.list.length == 0){
                return false;

            } else if (search_node.node_id > -1 && search_node.node_id < grid.width*grid.height){
                let search_node_id = search_node.node_id;
                
                let clone_node_list = new NodeList(this.list);
                clone_node_list.sort_by_id();
                
                let search_start = 0;
                let search_end = clone_node_list.list.length;
                let middle_index = Math.floor((search_end - search_start ) / 2);
                
                let list_contains_node = false;
                let search_complete = false;
                while (!search_complete && (search_end - search_start) > 0){  
                    if (clone_node_list.list[middle_index].node_id == search_node_id){
                        list_contains_node = true;
                        search_complete = true;
                    } else if (clone_node_list.list[middle_index].node_id > search_node_id) {
                        search_end = middle_index;
                        middle_index = Math.floor((search_end - search_start ) / 2) + search_start;
                    } else {
                        search_start = middle_index + 1;
                        middle_index = Math.floor((search_end - search_start ) / 2) + search_start;
                    }
                }
                return list_contains_node;
            } else {
                return false;
            }
        }

    }

    
    function euclidianHeuristic(start_coords, end_coords){
        return Math.sqrt(Math.pow((start_coords[0] - end_coords[0]),2) + Math.pow((start_coords[1] - end_coords[1]),2));
        //return Math.abs(start_coords[0] - end_coords[0]) + Math.abs(start_coords[1] - end_coords[1]);
    }

    function changeTileType() {
        if (button_state == 'blocked'){
            if (this.classList.contains('clear')){
                this.className ='';
                this.classList.add('tile', 'blocked');
            } else if (this.classList.contains('blocked')) {
                this.className = '';
                this.classList.add('tile', 'clear');
            }
        } else if (button_state == 'start'){
            let current_start = document.querySelector(".start");
            if (current_start != null) {current_start.classList.remove('start'); current_start.classList.add('clear');}
            this.className = '';
            this.classList.add('tile', 'start');
        } else if (button_state == 'goal'){
            let current_goal = document.querySelector(".goal");
            if (current_goal != null) {current_goal.classList.remove('goal'); current_goal.classList.add('clear');}
            this.className = '';
            this.classList.add('tile', 'goal');
        }
    }

	function resetOpenClosedPathTiles(){
		
		for (index=0; index<grid.tile_ids.length; index++){
			current_tile = document.getElementById(grid.tile_ids[index]);
			current_tile.classList.remove('open', 'closed', 'path');
			
		}
		
	}
	
	function resetAllTiles(){
		for (index=0; index<grid.tile_ids.length; index++){
			current_tile = document.getElementById(grid.tile_ids[index]);
			current_tile.className = '';
			current_tile.classList.add('tile', 'clear');
			
		}
	}

	function nodeId(node_coords){
		let node_row = node_coords[0];
		let node_col = node_coords[1];
		return node_row*grid.width + node_col;
	}


    function tileNumber(tile_element){
        return parseInt(tile_element.id.slice(5));
    }

    function tileCoords(tile_element){
        let tile_id_number = tileNumber(tile_element);
        let tile_row = Math.floor(tile_id_number / grid.height);
        let tile_col = tile_id_number % grid.height;
        return [tile_row, tile_col];
    }

    function tileElement(tile_number){
        let tile_element = document.getElementById("tile-" + tile_number.toString());
        return tile_element;
    }

    function currentPath(node_list, end_node_id){
        let path_list = [];
        let current_node = node_list.list[end_node_id];
        path_list.push(current_node);
        
        let came_from_node = node_list.list[node_list.list[end_node_id].came_from_id];
        if (came_from_node != null){
            let came_from_element = tileElement(came_from_node.node_id);
            
            while (!came_from_element.classList.contains("start")){
                path_list.unshift(came_from_node);
                current_node = node_list.list[came_from_node.node_id];
                came_from_node = node_list.list[node_list.list[current_node.node_id].came_from_id];
                came_from_element = tileElement(came_from_node.node_id);
                console.log(path_list);
            }
        }
        return path_list;

    }


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
     }

    async function aStar(){
        
		resetOpenClosedPathTiles();
		
		let start_tile_element = document.querySelector(".start");
        let goal_tile_element = document.querySelector(".goal");
        let start_and_goal_selected = (start_tile_element != null) && (goal_tile_element != null);

        if (start_and_goal_selected) {
            
            let start_tile_row = tileCoords(start_tile_element)[0];
            let start_tile_col = tileCoords(start_tile_element)[1];

            let goal_tile_row = tileCoords(goal_tile_element)[0];
            let goal_tile_col = tileCoords(goal_tile_element)[1];

            start_tile_message = "Starting tile is located at row " + start_tile_row.toString() + " and col " + start_tile_col.toString();
            goal_tile_message = "Goal tile is located at row " + goal_tile_row.toString() + " and col " + goal_tile_col.toString();
            console.log(start_tile_message);
            console.log(goal_tile_message);

            let total_node_list = new NodeList();

            //create a node for each tile, append node list appropriately
            for (let index = 0; index < grid.tile_ids.length; index++){
                let current_tile_element = document.getElementById("tile-"+index.toString());
                let current_new_node = new Node(current_tile_element, goal_tile_element, grid.width*grid.height*1000);
                current_new_node.f_score = grid.width*grid.height*1000;

                if (current_tile_element.classList.contains('start')){
                    current_new_node.update_g_score(0);
                }
                
                total_node_list.append(current_new_node);
            }

            
       
            //create open node list and closed node list

            let open_node_list = new NodeList([total_node_list.list[tileNumber(start_tile_element)]]);
            let closed_node_list = new NodeList();
            let path_end = open_node_list.list[0];

            //MAIN LOOP
            while (open_node_list.list.length > 0){
                await sleep(20);
                open_node_list.sort_by_f_score();
                path_end = open_node_list.list[0];
                let current_node = open_node_list.list.shift();
                closed_node_list.append(current_node);
                //check to see if current node is the goal
                if (current_node.node_id == tileNumber(goal_tile_element)){
                    break;
                } else {
                    let current_neighbor_list = current_node.get_neighbor_ids();
                    for (let index = 0; index < current_neighbor_list.length; index++){
                        let current_neighbor_node = total_node_list.list[current_neighbor_list[index]];
                        let tentative_g_score = current_node.g_score + euclidianHeuristic(current_node.node_coords, current_neighbor_node.node_coords);
                        //check if this current path to the neighbor is more efficient, update total node list
                        if (tentative_g_score < current_neighbor_node.g_score){
                            current_neighbor_node.update_came_from_id(current_node.node_id);
                            current_neighbor_node.update_g_score(tentative_g_score);
                            current_neighbor_node.update_f_score();
                            total_node_list.list[current_neighbor_node.node_id] = current_neighbor_node;
                        }

                        //add neighbor to open node list if it's not already there
                        if (!open_node_list.contains_node(current_neighbor_node) && !closed_node_list.contains_node(current_neighbor_node)){
                            open_node_list.append(current_neighbor_node);
                        }

                    }

                }

                open_node_list.sort_by_f_score();

                //console.log(open_node_list);
                
                //change html classes of tiles based on node lists
                for (let index = 0; index < open_node_list.list.length; index++){
                    let tile_element = tileElement(open_node_list.list[index].node_id);
                    if (tile_element != null && !tile_element.classList.contains('start') && !tile_element.classList.contains('goal')){
                        tile_element.classList.add('open');
                    }
                }
                


                for (let index = 0; index < closed_node_list.list.length; index++){
                    let tile_element = tileElement(closed_node_list.list[index].node_id);
                    if (tile_element != null && !tile_element.classList.contains('start') && !tile_element.classList.contains('goal')){
                        tile_element.classList.remove('open');
                        tile_element.classList.add('closed');
                    }
                }

            }
            
            
            let current_path_list = currentPath(total_node_list, path_end.node_id);
            console.log(current_path_list);

            for (let index = 0; index < current_path_list.length; index++){
                let tile_element = tileElement(current_path_list[index].node_id);
                if (tile_element != null && !tile_element.classList.contains('start') && !tile_element.classList.contains('goal')){
                    tile_element.classList.remove('open', 'closed');
                    tile_element.classList.add('path');
                }
            }


        } else {
            console.log('Please select a starting and goal tile');
        }
    }


    let button_state = 'blocked';

    //create grid
    let grid = new TileGrid(35, 35, 20);

    //create buttons
    let buttons = document.createElement('div');
    buttons.classList.add('button-box');

    let reset_button = document.createElement('button');
    reset_button.id = 'reset_button';
    reset_button.textContent = 'Reset';
	reset_button.addEventListener('click', resetAllTiles)
    buttons.appendChild(reset_button);
	
	let obstacle_button = document.createElement('button');
    obstacle_button.id = 'obstacle_button';
    obstacle_button.textContent = 'Place Obstacle';
    obstacle_button.addEventListener('click', () => {button_state = 'blocked';})
    buttons.appendChild(obstacle_button);

    let start_button = document.createElement('button');
    start_button.id = 'start_button';
    start_button.textContent = 'Place Start';
    start_button.addEventListener('click', () => {button_state = 'start';})
    buttons.appendChild(start_button);

    let goal_button = document.createElement('button');
    goal_button.id = 'goal_button';
    goal_button.textContent = 'Place Goal';
    goal_button.addEventListener('click', () => {button_state = 'goal';})
    buttons.appendChild(goal_button);

    let run_button = document.createElement('button');
    run_button.id = 'run_button';
    run_button.textContent = 'Run';
	run_button.addEventListener('click', aStar)
    buttons.appendChild(run_button);
	

    canvas.appendChild(buttons);
	

});