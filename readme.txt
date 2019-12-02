This file contains Installation and Configuration of OPP Event API
==================================================================
1) Check for the following programs
    - Git (Application Version Control)
    - Node.js and npm
    - MySQL Server (if database within the same server)
    - iisnode and urlrewrite2
    - ARRv3_0

2) Install Node Process Manager PM2
    > npm i -g pm2

3) Add Node Project to C:\applications folder
4) Add /public folder inside your project
5) Add (.env) file to "OPP Event API" and type the following:

    # .env settings
    NODE_ENV=development
    PORT=3000

    # app settings
    APP_NAME=opp_event_server
    APP_VERSION=1.0.0

    # database settings
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=
    DB_NAME=OPP_EVENT

6) Open CMD or PowerShell and type the following:
    > cd C:\applications\<project_name>
    > pm2 start app.js --name "OPP Event API"

    (note): Make sure PM2 is running

7) Deploy Node App to IIS:
    