// Imports/Setup

var engines = require('consolidate');
var anyDB = require('any-db');
var login_conn = anyDB.createConnection('sqlite3://accounts.db')
var http = require('http'); 
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
sha256 = require('js-sha256');

app.engine('html', engines.hogan); // tell Express to run .html files through Hogan
app.set('views', __dirname + '/templates'); // tel
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());


///////////////////////////////
////  Init Resful API Call ////
///////////////////////////////

app.get('/', function(req, res){
  res.render('login.html');
});


io.sockets.on('connection', function (socket) {
  ///////////////////////////////////////////////////////////
  ////  On connection nonce is sent to client and stored //// 
  ///////////////////////////////////////////////////////////

  //Variables for making random text
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  //Generates random text
  for( var i=0; i < 20; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  //Hash the nonce for extra strength
  var nonce = sha256(text);

  //Set nonce to a global variable
  socket.nonce = nonce;

  //Send nonce
  socket.emit('getNonce', nonce);




///////////////////////////////
///// SECURE LOGIN SYSTEM /////
///////////////////////////////

  socket.on('login', function(password, username){
      //  Initializes as false just incase
      //  It really should happen just makes me feel better
      socket.loggedin = false;

      ////////////////////////////////////////////////////////
      ////  Creation of list for Passwords and Usernames  ////
      ////////////////////////////////////////////////////////

      // Create an empty array to add data during db query 
      var accounts = [];

      // Creates the db query that will return a list of users where the user name is the sent username
      // The use of the '$1' is for protection against sql injection attacks

      q = login_conn.query('SELECT PASSWORD FROM Main WHERE USERNAME=$1', [username]);

      // On the query's 'data' each row is added to accounts array
      q.on('data', function(row){

        // If the usernames are unique there should only ONE in the array
        accounts.push(row);

      });

      // On the db query's end: 
      q.on('end', function(){

        // Checks to see if there are any accounts in db with the entered username
        // If there are no usernames matching in the database accounts will be 0
        if(accounts.length == 0){

          // If there are no usernames the socket sends loginRes with a false message.
          socket.emit('loginRes', socket.loggedin);
        }
      // it first loops through all the items that were found in the db
      // As I had said earier there should only be ONE if the db is run correctly
        for(var i=0; i < accounts.length; i++){

          // The socket's nonce and the pre-hashed db password is combined into var combine
          // The password's in the db should already be hashed once so no raw passwords are stored
          var combine = socket.nonce += accounts[i].PASSWORD;
          // The combination is then hashed again to possible match the password sent by the client
          var hashedCombine = sha256(combine);


          // The hashed password + nonce is then compaired to the password sent by the client side
          if(hashedCombine === password){
            // If the passwords match you know that the user enterd the proper password
            // The Timeout is to add a delay to the users login proccess in hopes to prevent spamming tries that
            // refresh the page after one second to speed up proccess
            setTimeout(function() {

              // the socket then stores the username and loggedin 
              // This is used to make sure the session is verified and can trace actions done by a certian user 
              socket.user = username;
              // Sets loggedin to true as the login was succesful
              socket.loggedin = true;

              socket.emit('loginRes', socket.loggedin);

            }, 3000);

          }else{

            //  If the password does NOT equal the password in the db:
            //  A time function is added to prevent from spamming tries
            setTimeout(function() {

              // Loggedin is default false (set on line 60)
              socket.emit('loginRes', socket.loggedin);
              // a simple emit back to the login page is done here, but...
              // you could add a invalid tries counter (with timestamp) to furthur prevent spam
              // or run a client side function that gives a nice 'invalid username/password' message
            }, 3000);
          }

        }
      });

    });






}); //End socket statement

server.listen(8080); //Starts listening on port 8080;