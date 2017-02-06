// $(function() {

	/************ The Variables ************************/
	var global = {};
	global.username = undefined;
	global.coPlayerName = undefined;
	global.socket = io.connect();
	global.gameID = undefined;
	global.whoseTurn = undefined;
	global.last_recieved_game_msg = undefined;
	global.last_sent_game_msg = undefined;
	global.awaiting_server_response = true;
	global.playerSign = undefined;
	global.coPlayerSign = undefined;
	////////////////////////////////////////////////////





	/*************** EVENT BINDINGS START ***********************/
	global.socket.on("GAME_CREATED", serverCreatedNewGameID);

	global.socket.on("GAME_MSG", gameMsgHandler);

	$('#btn_StartNewGame').on('click', startNewGame);

	$('#btn_JoinGame').on('click', joinGame);

	$('#modal .msgContainer .closeIcon').on('click', hideMessage);

	$('#gameBoard').on('click', '.cell-inner', handleCellClick);
	/************************************************************/






	/***************************************************************
	* When user clicks on btn_StartNewGame on home page
	* this function is called.
	* If username field is blank, show error that it is mandatory
	* if username is available, then,
	* Connect to socket
	****************************************************************/
	function startNewGame () {
		var username = $('#input_username').val().trim();
		if (username.length <= 0) {
			showError('input_username');
		}
		else {
			hideError('input_username');
			global.username = username;			

			sendToServer("NEW_GAME", global.username);
		}
	}
	/////////////////////////////////////////////////////////////////



	/**************************************************************
	* This function will be called when user clicks on JOIN GAME Btn
	* It will check if both the username and gameID is present
	**************************************************************/
	function joinGame () {
		var isError = false;
		var username = $('#input_username1').val().trim();
		var gameID = $('#input_GameID').val().trim();

		//Check if username is present
		if (username.length <= 0) {
			showError('input_username1');
			isError = true;
		}
		else {
			hideError('input_username1');
			global.username = username;
		}


		//Check if gameID is present
		if (gameID.length <= 0) {
			showError('input_GameID');
			isError = true;
		}
		else {
			hideError('input_GameID');
			global.gameID = gameID;
		}

		//If all is good, ask server to join
		if (!isError) {
			var userInfo = {
				"username": global.username,
				"gameID": global.gameID,
				"socketID": global.socket.id
			};

			sendToServer("JOIN_GAME", userInfo);
		}
	}
	///////////////////////////////////////////////////////////////





	/**************************************************************
	* This function will emit and event to server with some data
	**************************************************************/
	function sendToServer (event, data) {
		global.socket.emit(event, data);
	}
	///////////////////////////////////////////////////////////////


	/**************************************************************
	* This function will be called when user clicks on a game cell 
	* if we are waiting for server response (e.g user has just played)
	* Or, it is not his turn to play, just get him out of here.....
	**************************************************************/
	function handleCellClick (ev) {
		if (global.awaiting_server_response || global.whoseTurn !== global.username) {
			return;
		}

		//Now that we know user is playing his turn
		//get the cell id where he clicked
		var cellID = $(ev.target).closest('.cell').attr('id');

		var success = false;

		//check if that cell is blank
		var cells = global.last_recieved_game_msg.cells;
		for(var i in cells) {
			if (cells[i].id === cellID) {
				
				//check if clicked cell is blank
				if (cells[i].sign === "blank") {
					cells[i].sign = global.playerSign;
					global.whoseTurn = "Not Mine...";
					putSignInCell(cellID, global.playerSign);
					//showWait();
					showTokenMsg("Wait...");
					success = true;
				}
				
				break;
			} 
		}

		//if cell click was successful, send the new cell list to server
		if(success) {
			global.last_sent_game_msg = global.last_recieved_game_msg;
			//This step might be unneccessary as arrays are passed by ref
			global.last_sent_game_msg.cells = cells;

			sendToServer("GAME_MSG", global.last_sent_game_msg);
			global.awaiting_server_response = true;
		}		
	}



	function putSignInCell (cellID, sign) {
		htm = (sign === 'cross') ? '<i class="sign cross fa fa-times"/></i>' : '<i class="sign circle fa fa-circle-o"></i>';

		$('#'+cellID +' .cell-inner').html(htm);
	}



	function showTokenMsg (msg) {
		$('#tokenMsg .msg').text(msg);
		$('#tokenMsg').show();
	}

	function hideTokenMsg () {
		$('#tokenMsg').hide();
	}


	/**************************************************************
	* This function will be called when server has created a 
	* new gameID as per user's request of starting a new game 
	* Navigate to Game Page
	**************************************************************/	
	function serverCreatedNewGameID (gameID) {
		global.gameID = gameID;
		showMessage("Ask your partner to join game using <b>GAME ID = " + gameID
			+ "</b><br/>Once he joins, your game will start automatically...", true);
	}
	///////////////////////////////////////////////////////////////


	/**************************************************************
	* This function will show the msg in the modal
	* By default close icon will be shown
	* But if user needs to be stopped on that screen for waiting
	* pass true as 2nd parameter, so that user will not be able to 
	* close the modal
	**************************************************************/
	function showMessage (msgHTML, hideCloseIcon) {
		var hideCloseIcon = hideCloseIcon || false;
		if (hideCloseIcon) {
			$('#modal .msgContainer .closeIcon').hide();
		} 
		else {
			$('#modal .msgContainer .closeIcon').show();
		}
		$('#modal .msg').html(msgHTML);
		$('#modal').show();
	}
	//////////////////////////////////////////////////////////////


	/**************************************************************
	* Complimentary of showMessage function
	**************************************************************/
	function hideMessage () {
		$('#modal .msg').html("");
		$('#modal').hide();
	}
	//////////////////////////////////////////////////////////////


	function showWait () {
		$('#modal').addClass('justWait').show();
	}

	function hideWait () {
		$('#modal').removeClass('justWait').hide();
	}

	/**************************************************************
	* This function handles Game specific messages from server
	**************************************************************/
	function gameMsgHandler (gameMsg) {
		console.log('gameMsg'); console.log(gameMsg);

		global.whoseTurn = gameMsg.whoseTurn.username;
		global.awaiting_server_response = false;
		global.last_recieved_game_msg = gameMsg;

		//1st time comes Init
		if (gameMsg.type === 'Init') {
			//That means 2nd player has just joined
			//Show the GAME-PAGE for 1st time
			hideMessage();
			
			$('#gameDetails .player1').text("(" + gameMsg.players[0].sign + ") " + gameMsg.players[0].username);
			$('#gameDetails .player2').text("(" + gameMsg.players[1].sign + ") " + gameMsg.players[1].username);

			createGameBoard(gameMsg.cells);

			showPage("page-game");

			getUserSign(gameMsg.players);

			//if it is not my turn, tell me
			if (global.whoseTurn !== global.username) {
				global.coPlayerName = global.whoseTurn;
				showTokenMsg("Wait!!! " + global.whoseTurn + "'s turn...");
			} else {
				showTokenMsg('Your turn... Click a cell');				
			}
		}
		else if (gameMsg.type === 'Running') {
			updateCellSigns (gameMsg.cells);
			hideWait();
			if (global.whoseTurn === global.username) {
				showTokenMsg("Hi " + global.username + ", Your Turn...");
			} 
			else {
				showTokenMsg("Wait!!! " + global.whoseTurn + "'s turn...");
			}			
		}

		adjustTurnIndicator();
	}






	function updateCellSigns (cells) {
		for(var i in cells) {
			if(cells[i].sign !== "blank") {
				putSignInCell(cells[i].id, cells[i].sign);
			}
		}
		adjustSizes();
	}



	function getUserSign (players) {
		if (players[0].username === global.username) {
			global.playerSign = players[0].sign;
			global.coPlayerSign = players[1].sign;
		} 
		else {
			global.playerSign = players[1].sign;
			global.coPlayerSign = players[0].sign;
		} 

		for (var i in players) {
			if(players[i].username === global.username) {
				global.playerSign = players[i].sign;
				break;
			}
		}
	}


	function showPage (pageClass) {
		//hide all other pages
		$('.page').hide();

		//show this particular page only
		$('.' + pageClass).show();
	}


	function adjustTurnIndicator () {
		$('#gameDetails .playerInfoCOntainer').each(function(){
			var playerName = $(this).find('.player').text().trim();
			if (playerName === global.whoseTurn) {
				$(this).addClass('hisTurn');
			} 
			else {
				$(this).removeClass('hisTurn');
			}
		})
	}

	/*
	* Every reuired input field will have a hidden error msg field
	* just after it.
	* So, this function will show the error msg corresponding
	* to the input_field_ID provided
	*/
	function showError (input_ID) {
		$('#'+input_ID + " + .error").show();
	}

	/*
	* Just complimentory to showError
	*/
	function hideError (input_ID) {
		$('#'+input_ID + " + .error").hide();
	}


	$(window).on('resize', adjustSizes);

	init();

	function init () {
		showPage('page-home');
	}


	function adjustSizes () {
		$('.cell').height($('.cell').width());
		$('.sign').css('font-size', $('.cell-inner').height());
	}


	function createGameBoard (cells) {
		var htm = '';

		for(var i in cells) {			
			htm +=
			'<div class="cell col-xs-4" id="' + cells[i].id + '">'
			+ 	'<div class="cell-inner">'
			+ 	'</div>'
			+'</div>';
		}

		$('#gameBoard').html(htm);

		setTimeout(adjustSizes, 100);
	}



// })