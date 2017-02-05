// $(function() {

	/************ The Variables ************************/
	var global = {};
	global.username = undefined;
	global.socket = io.connect();
	global.gameID = undefined;
	////////////////////////////////////////////////////





	/*************** EVENT BINDINGS START ***********************/
	global.socket.on("GAME_CREATED", serverCreatedNewGameID);

	global.socket.on("GAME_MSG", gameMsgHandler);

	$('#btn_StartNewGame').on('click', startNewGame);

	$('#btn_JoinGame').on('click', joinGame);
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
	* This function will be called when server has created a 
	* new gameID as per user's request of starting a new game 
	* Navigate to Game Page
	**************************************************************/	
	function serverCreatedNewGameID (gameID) {
		global.gameID = gameID;
		showMessage("Ask your partner to join game using <b>GAME ID = " + gameID
			+ "</b><br/>Once he joins, your game will start automatically...");
	}
	///////////////////////////////////////////////////////////////


	/**************************************************************
	* This function will show the msg in the modal
	**************************************************************/
	function showMessage (msgHTML) {
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


	/**************************************************************
	* This function handles Game specific messages from server
	**************************************************************/
	function gameMsgHandler (gameMsg) {
		console.log('gameMsg'); console.log(gameMsg);

		if (gameMsg.type === 'Init') {
			//That means 2nd player has just joined
			//Show the GAME-PAGE for 1st time
			hideMessage();
			createGameBoard(gameMsg.cells);
			showPage("page-game");

			//if it is not my turn, tell me
			if (gameMsg.whoseTurn.username !== global.username) {
				showMessage(gameMsg.whoseTurn.username + " has got the 1st chance to play. Wait for him to play...");
			} else {
				showMessage('Your turn 1st... <br/><br/>Click on any empty cell to play...<br/><br/><b>This message will automatically dissappear in 5 seconds</b>');
				setTimeout(function() {
					hideMessage();
				}, 5000);
			}
		}
	}


	function showPage (pageClass) {
		//hide all other pages
		$('.page').hide();

		//show this particular page only
		$('.' + pageClass).show();
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
		adjustSizes();
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

		adjustSizes();
	}



// })