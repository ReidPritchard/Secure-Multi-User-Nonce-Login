var socket = io.connect();

// Setting up clobal nonce this will be used to verify logins
var globalNonce;

// working will control if the html is in its "authenticating screen"
var working = false;


  ////////////////////////
  ////  On Page Load: ////
  ////////////////////////

window.addEventListener('load', function(){
  socket.on('getNonce', function(nonce){
    globalNonce = nonce;
  });
});


// Once the button with html class .login is pressed/submitted
// the fucntion with variable event_ is run
$('.login').on('submit', function(event_) {

  // .preventDeafault() stops the button from being clicked again
  // making spamming request more difficult
  event_.preventDefault();

  // The username and password imputted is stored to begin hashing proccess
  var username = $('#username').val();
  var password = $('#password').val();

  // This short hadn if statement will stop the fucntion if working is true
  // As default it is false
  if (working) return;
 
  // Working is then set to true as hashing is beginning 
  working = true;

    // Loads document as $this to be used for search
    var $this = $(this);

    // $this is then searched to find class .state inside button
    // by default this is "login" (The text on the login button)
    $state = $this.find('button > .state');
    
    // This will change the style the button (enlarge to fill login box)
    // This is done by using prefixfree js allows you to set styles before they are present
    // It changes the form from "login" to "login loading" (sorry for the bad explination)
    $this.addClass('loading');

    // Changes button's span(text) from "login" to "Authenticating"
    $state.html('Authenticating');

    // A new SHA object is created with SHA-256 as the encryption type
    var shaObj = new jsSHA("SHA-256", "TEXT");
    // .update sets what will be hashes when the object.getHash is used
    shaObj.update(password);

    // Runs the hash function (in HEX) that is stored as var pass
    var pass = shaObj.getHash("HEX");

    // Combine the nonce sent by the server with the inputted password
    var combine = globalNonce + pass;

    // Another new SHA object is created with SHA-256 as the encryption type
    var shaObj2 = new jsSHA("SHA-256", "TEXT");
    // Adds the combination of nonce and hashed password
    shaObj2.update(combine);

    // The combination is then hashed again to create the finial version
    var hash_pass = shaObj2.getHash("HEX");

    //  The socket then emits (to server) with the function "login"
    //  Sending the final password and username
    socket.emit('login', hash_pass, username);


    // Will only listen for the response if "login" has been run
    // loginRes takes in boolean res (socket.loggedin)
      socket.on('loginRes', function(res) {

        // If the login was succesful the respose will be true
        if(res == true){

          // A delay will be created to give the login system a better feel
          // I like to think that login's are working while I wait but they probally aren't
          setTimeout(function(){

            // Changes form's class "login loading" (first changed on line 50) to "login loading ok" 
            $this.addClass('ok');

            // Changes button's span(text) from "Authenticating"(first changed on line 53) to "Welcome Back!"
            $state.html('Welcome back!');

            // A delay will be created to give the login system a better feel
            setTimeout(function(){

              // After the time runs out a redirect to a different html page is made.
              // It is recomended that socket.loggedin is tested to make sure that the
              // user is allowed to enter the page
              // But for now this will do
              window.location = "/main.html";

              // Setting length of delay 
            }, 2000);
          // Setting length of delay 
          }, 2000);

        // If the response is false 
        }else{

          // A delay will be created to give the login system a better feel
          setTimeout(function() {
          
            // The state is changed back to Log in as the user must enter a propper password
            $state.html('Log in');

            // The loading calss is removed and the button returns to normal shape
            $this.removeClass('ok loading');

          // working is now false as the login system is no longer working
          // and is now awaiting users input
          working = false;

        // The amount of delay is set at the end of the setTimeout function
        }, 4000);

      };

    });

});


//////  This was written with help (on concepts) from Zach Minster (My Computer science teacher @ St. Annes Belfied School)
//////
//////  I wrote all the code in Client.js and Server.js and the Html and Css were 
//////  found off a templeting service online link: https://www.freshdesignweb.com/css-login-form-templates/
//////  I take no credit for any html and css. Some parts of the html/css were edited (mainly) to change color schema
//////