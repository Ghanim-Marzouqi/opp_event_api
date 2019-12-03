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

    # active directory settings
    AD_HOST=ldap://<active-directory-domain>:<active-directory-port>
    AD_BASE=DC=<domain-name>,DC=<domain-type>
    AD_USER=<active-directory-user>
    AD_PASS=<active-directory-pass>

    # database settings
    DB_HOST=<database-server-ip>
    DB_USER=<database-user>
    DB_PASS=<database-pass>
    DB_NAME=<database-name>

    # email settings
    MAIL_HOST=<mail-server-ip>
    MAIL_PORT=<mail-server-port>
    MAIL_USER=<email-user>
    MAIL_PASS=<email-pass>

6) Open CMD or PowerShell and type the following:
    > cd C:\applications\<project_name>
    > pm2 start app.js --name "OPP Event API"

    (note): Make sure PM2 is running

7) Deploy Node App to IIS:
    