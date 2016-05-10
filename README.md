# Secure-Multi-User-Nonce-Login
A secure multi-user nonce login. Using node js, sqlite, express, and socket.io.

Nonce is a secure login system that uses a unique (for each session) ID that is given to the client on connection.
  The Client then hashes the inputed login, adds the unique ID and re=hashes again. 
  This new hashed combination of password and secert is then sent to the server where the server repeats similar steps.
  The server takes the pre-hashed password from the db, adds the session's unique ID, and then re-hashes the combination. 
  This combination is then compaired with the combination sent from the client to verify the passwords match.
  
If this is still confusing there are many reasources that describe this proccess in much clearer ways.
Also I would recommend drawing a diagram to help visualize the transaction between client and server.



#Database Scheme#

|ID|Password|Username|

This is the layout of the db I used for this project.
You do not have to use this same format.
To create an exact copy of this db you can run db-builder.py
or simply create your own.

To fill the db you simply put a sha256-hashed password into the password field and a text user name.
This helps with security as no plain passwords are stored so in the unfortunate circumstance of your db becoming compromised the attacker can't see/gain access to any accounts.

The db can hold other infromation that you may want to keep stored with you user.
If so you may want to set your socket.x = xFromDB; to have all the needed infromation easily accesable.

#Questions#

If you have any questions about the code feel free to email me at rpritchard@students.stab.org. 
If there are any issue please report them and I will fix them as soon as possible