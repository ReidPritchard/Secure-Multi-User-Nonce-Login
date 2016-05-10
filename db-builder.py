import sqlite3
conn = sqlite3.connect('accounts.db')
c = conn.cursor()

c.execute('''CREATE TABLE "Main" (
	"ID" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"PASSWORD" TEXT,
	"USERNAME" TEXT
);''')