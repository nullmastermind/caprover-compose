### Examples

Here are some example configurations for the Caprover One-Click App. Please refer to them to modify other configuration files appropriately and ensure they have the correct structure.

```
<examples>
<example>
captainVersion: 4
caproverOneClickApp:
    instructions:
        start: |-
            Apache Airflow is a tool to express and execute workflows as directed acyclic graphs (DAGs). 
            It includes utilities to schedule tasks, monitor task progress and handle task dependencies.
            This instance uses the Bitnami images
        end: >
            Airflow is deployed is deployed, it might take few moments before it's fully started.
            Initial user is: $$cap_airflow_user with password $$cap_airflow_password.
            Login on $$cap_appname.$$cap_root_domain after $$cap_appname has finished starting.

    displayName: Airflow
    isOfficial: false
    description: A tool to express and execute workflows as directed acyclic graphs (DAGs).
    documentation: |-
        Based on https://github.com/bitnami/bitnami-docker-airflow#readme

    variables:
        # Postgress
        - id: $$cap_postgresql_version
          label: Bitnami's Posgresql Version
          defaultValue: '12.12.0'
          description: Check the tag version on https://hub.docker.com/r/bitnami/postgresql
        - id: $$cap_postgresql_name
          label: Postresql database name
          defaultValue: airflow_db
          description: Name of the postgresql db
        - id: $$cap_postgresql_user
          label: Postresql database user
          defaultValue: airflow_db_user
          description: Password to the postgresql db
        - id: $$cap_postgresql_password
          label: Postresql password
          defaultValue: $$cap_gen_random_hex(16)
          description: Password to the postgresql db
        # Redis
        - id: $$cap_redis_version
          label: Bitnami's redis Version
          defaultValue: '7.0.4'
          description: Check the tag version on https://hub.docker.com/r/bitnami/redis
        - id: $$cap_redis_password
          label: Redis password
          defaultValue: $$cap_gen_random_hex(16)
          description: Password to redis db
        # Airflow
        - id: $$cap_airflow_version
          label: Bitnami's airflow Version
          defaultValue: '2.3.3'
          description: Check the tag version on https://hub.docker.com/r/bitnami/airflow
        - id: $$cap_airflow_worker_version
          label: Bitnami's airflow worker Version
          defaultValue: '2.3.3'
          description: Check the tag version on https://hub.docker.com/r/bitnami/airflow-worker
        - id: $$cap_airflow_scheduler_version
          label: Bitnami's airflow scheduler Version
          defaultValue: '2.3.3'
          description: Check the tag version on https://hub.docker.com/r/bitnami/airflow-scheduler
        - id: $$cap_airflow_user
          label: Airflow user
          defaultValue: 'airflow_user'
          description: Airflow's Admin user name
        - id: $$cap_airflow_password
          label: Airflow password
          defaultValue: $$cap_gen_random_hex(16)
          description: Airflow Admin's password
        - id: $$cap_airflow_email
          label: Airflow email
          description: Email address that will receive notifications from airflow (need SMPT details)
        - id: $$cap_airflow_examples
          label: Load Airflow DAG Examples?
          defaultValue: 'no'
          description: Wheter to load or not load sample DAGs (yes/no)
        - id: $$cap_airflow_secret_key
          label: Airflow Secret Key
          defaultValue: $$cap_gen_random_hex(16)
          description: Secret key used to run your flask app. It should be as random as possible.
        - id: $$cap_airflow_dag_path
          label: DAGs Volume
          defaultValue: airflow-dags
          description: Name of the DAG volume or Path to the custom DAGs folder, make sure the folder is accesible
        - id: $$cap_airflow_py_requirements
          label: Path or volume to a requirements.txt file
          defaultValue: airflow-requstxt
          description: Installation of additional python modules at start-up time, make sure the file is accesible
        # SMTP datails
        - id: $$cap_smtp_host
          label: SMTP Host
          description: Host for SMPT connection
        - id: $$cap_smtp_port
          label: SMTP Port
          description: Port for SMPT connection
        - id: $$cap_smtp_starttls
          label: Use startTLS?
          defaultValue: 'no'
          description: Do you want to use startTLS? (yes/no)
        - id: $$cap_smtp_ssl
          label: Use SSL?
          defaultValue: 'no'
          description: Check the tag version on https://hub.docker.com/r/bitnami/airflow-scheduler
        - id: $$cap_smtp_user
          label: SMTP User
          description: Check the tag version on https://hub.docker.com/r/bitnami/airflow-scheduler
        - id: $$cap_smtp_password
          label: SMTP Password
          description: Check the tag version on https://hub.docker.com/r/bitnami/airflow-scheduler
        - id: $$cap_smtp_mail_from
          label: Mail from address
          description: Specofy who the email is from

services:
    $$cap_appname-db:
        restart: always
        image: 'bitnami/postgresql:$$cap_postgresql_version'
        user:
        environment:
            POSTGRESQL_DATABASE: $$cap_postgresql_name
            POSTGRESQL_USERNAME: $$cap_postgresql_user
            POSTGRESQL_PASSWORD: $$cap_postgresql_password
        volumes:
            - $$cap_appname-postgresql-persistance:/bitnami
        caproverExtra:
            notExposeAsWebApp: true

    $$cap_appname-redis:
        restart: always
        image: 'bitnami/redis:$$cap_redis_version'
        user:
        environment:
            REDIS_PASSWORD: $$cap_redis_password
        volumes:
            - $$cap_appname-redis-persistance:/bitnami
        caproverExtra:
            notExposeAsWebApp: true

    $$cap_appname:
        restart: always
        depends_on:
            - $$cap_appname-db
            - $$cap_appname-redis
        image: 'bitnami/airflow:$$cap_airflow_version'
        user:
        environment:
            AIRFLOW_EXECUTOR: CeleryExecutor
            AIRFLOW_DATABASE_HOST: srv-captain--$$cap_appname-db
            AIRFLOW_DATABASE_NAME: $$cap_postgresql_name
            AIRFLOW_DATABASE_USERNAME: $$cap_postgresql_user
            AIRFLOW_DATABASE_PASSWORD: $$cap_postgresql_password
            REDIS_HOST: srv-captain--$$cap_appname-redis
            REDIS_PASSWORD: $$cap_redis_password
            AIRFLOW_WEBSERVER_HOST: srv-captain--$$cap_appname
            AIRFLOW_BASE_URL: https://$$cap_appname.$$cap_root_domain/
            AIRFLOW_SECRET_KEY: $$cap_airflow_secret_key
            AIRFLOW_LOAD_EXAMPLES: $$cap_airflow_examples
            AIRFLOW_USERNAME: $$cap_airflow_user
            AIRFLOW_PASSWORD: $$cap_airflow_password
            AIRFLOW_EMAIL: $$cap_airflow_email
            AIRFLOW__SMTP__SMTP_HOST: $$cap_smtp_host
            AIRFLOW__SMTP__SMTP_PORT: $$cap_smtp_port
            AIRFLOW__SMTP__SMTP_STARTTLS: $$cap_smtp_starttls
            AIRFLOW__SMTP__SMTP_SSL: $$cap_smtp_ssl
            AIRFLOW__SMTP__SMTP_USER: $$cap_smtp_user
            AIRFLOW__SMTP__SMTP_PASSWORD: $$cap_smtp_password
            AIRFLOW__SMTP__SMTP_MAIL_FROM: $$cap_smtp_mail_from
        volumes:
            - $$cap_airflow_dag_path:/opt/bitnami/airflow/dags
            - $$cap_airflow_py_requirements:/bitnami/python/requirements.txt
        caproverExtra:
            containerHttpPort: '8080'

    $$cap_appname-worker:
        image: bitnami/airflow-worker:$$cap_airflow_worker_version
        depends_on:
            - $$cap_appname
        environment:
            AIRFLOW_EXECUTOR: CeleryExecutor
            AIRFLOW_DATABASE_HOST: srv-captain--$$cap_appname-db
            AIRFLOW_DATABASE_NAME: $$cap_postgresql_name
            AIRFLOW_DATABASE_USERNAME: $$cap_postgresql_user
            AIRFLOW_DATABASE_PASSWORD: $$cap_postgresql_password
            REDIS_HOST: srv-captain--$$cap_appname-redis
            REDIS_PASSWORD: $$cap_redis_password
            AIRFLOW_WEBSERVER_HOST: srv-captain--$$cap_appname
            AIRFLOW_BASE_URL: https://$$cap_appname.$$cap_root_domain/
            AIRFLOW_SECRET_KEY: $$cap_airflow_secret_key
            AIRFLOW_LOAD_EXAMPLES: $$cap_airflow_examples
        volumes:
            - $$cap_appname-data:/opt/bitnami/airflow/data
            - $$cap_airflow_dag_path:/opt/bitnami/airflow/dags
            - $$cap_airflow_py_requirements:/bitnami/python/requirements.txt
        caproverExtra:
            notExposeAsWebApp: true

    $$cap_appname-scheduler:
        restart: always
        depends_on:
            - $$cap_appname
        image: 'bitnami/airflow-scheduler:$$cap_airflow_scheduler_version'
        user:
        environment:
            AIRFLOW_EXECUTOR: CeleryExecutor
            AIRFLOW_DATABASE_HOST: srv-captain--$$cap_appname-db
            AIRFLOW_DATABASE_NAME: $$cap_postgresql_name
            AIRFLOW_DATABASE_USERNAME: $$cap_postgresql_user
            AIRFLOW_DATABASE_PASSWORD: $$cap_postgresql_password
            REDIS_HOST: srv-captain--$$cap_appname-redis
            REDIS_PASSWORD: $$cap_redis_password
            AIRFLOW_WEBSERVER_HOST: srv-captain--$$cap_appname
            AIRFLOW_BASE_URL: https://$$cap_appname.$$cap_root_domain/
            AIRFLOW_SECRET_KEY: $$cap_airflow_secret_key
            AIRFLOW_LOAD_EXAMPLES: $$cap_airflow_examples
        volumes:
            - $$cap_airflow_dag_path:/opt/bitnami/airflow/dags
            - $$cap_airflow_py_requirements:/bitnami/python/requirements.txt
        caproverExtra:
            notExposeAsWebApp: true
</example>

<example>
captainVersion: 4
services:
    $$cap_appname:
        image: vaultwarden/server:$$cap_bitwardenrs_version
        environment:
            DOMAIN: https://$$cap_appname.$$cap_root_domain
            WEBSOCKET_ENABLED: true
            SIGNUPS_ALLOWED: $$cap_register_enabled
            ADMIN_TOKEN: $$cap_admin_token
        ports:
            - 3012:3012
        volumes:
            - $$cap_appname-data:/data
        restart: unless-stopped
caproverOneClickApp:
    variables:
        - id: $$cap_bitwardenrs_version
          label: vaultwarden Version
          defaultValue: 1.30.1
          description: Check out their Docker page for the valid tags https://hub.docker.com/r/vaultwarden/server/tags
          validRegex: /^([^\s^\/])+$/
        - id: $$cap_register_enabled
          label: enabled open registration
          defaultValue: true
          description: If field is true, all visitors can create an account. If false, only the administrator can invite other users.
          validRegex: /^(true|false)$/
        - id: $$cap_admin_token
          label: admin password
          defaultValue:
          description: this password enables the admin zone on /admin. If you let this password empty, the admin interface will be disabled and it will be the best safety option.
    instructions:
        start: >-
            This is a Bitwarden server API implementation written in Rust compatible with upstream Bitwarden clients, perfect for self-hosted deployment where running the official resource-heavy service might not be ideal.

            This project is not associated with the Bitwarden project nor 8bit Solutions LLC.

            if you want more details please go to https://www.reddit.com/r/selfhosted/comments/fvld0n/bitwarden_vs_bitwarden_rs/
        end: >-
            Bitwarden_rs is deployed and available as $$cap_appname. Please give it a few minutes to boot, otherwise you will see a 502 error (even if the logs say it's working).

            Please activate https and https redirect otherwise you will have an error on account creation. You need to enable websocket too.

            If you enabled the admin token please go to https://$$cap_appname.$$cap_root_domain/admin to begin
    displayName: vaultwarden
    isOfficial: true
    description: Lightweight fully featured Rust implementation of Bitwarden.
    documentation: Taken from https://hub.docker.com/r/vaultwarden/server
</example>

<example>
captainVersion: 4
services:
    $$cap_appname:
        caproverExtra:
            containerHttpPort: 3000
            dockerfileLines:
                - FROM botpress/server:$$cap_BOTPRESS_VERSION
                - CMD /botpress/bp
        environment:
            DATABASE_URL: postgres://$$cap_POSTGRES_USER:$$cap_POSTGRES_PASSWORD@srv-captain--$$cap_appname-db/$$cap_POSTGRES_DB
            REDIS_URL: redis://srv-captain--$$cap_appname-cache?password=$$cap_REDIS_PASSWORD
            EXTERNAL_URL: http://$$cap_appname.$$cap_root_domain
            BP_MODULE_NLU_DUCKLINGURL: http://srv-captain--$$cap_appname-lang:8000
            BP_MODULE_NLU_LANGUAGESOURCES: '[{"endpoint": "http://srv-captain--$$cap_appname-lang:3100"}]'
            BP_PRODUCTION: $$cap_BOTPRESS_PRODUCTION
            BPFS_STORAGE: $$cap_BOTPRESS_STORAGE
            VERBOSITY_LEVEL: $$cap_BOTPRESS_VERBOSITY_LEVEL
            BP_DECISION_MIN_CONFIDENCE: $$cap_BOTPRESS_DECISION_MIN_CONFIDENCE
            FAST_TEXT_VERBOSITY: $$cap_BOTPRESS_FAST_TEXT_VERBOSITY
            FAST_TEXT_CLEANUP_MS: $$cap_BOTPRESS_FAST_TEXT_CLEANUP_MS
        depends_on:
            - $$cap_appname-lang
            - $$cap_appname-db
            - $$cap_appname-cache
        volumes:
            - $$cap_appname:/botpress/data

    $$cap_appname-lang:
        caproverExtra:
            notExposeAsWebApp: 'true'
            dockerfileLines:
                - FROM botpress/server:$$cap_BOTPRESS_VERSION
                - USER root
                - RUN mkdir /botpress/lang && chown -R botpress:botpress /botpress/lang
                - USER botpress
                - CMD bash -c "./duckling -p 8000 & ./bp lang --langDir /botpress/lang --port 3100"
        volumes:
            - $$cap_appname-lang:/botpress/lang

    $$cap_appname-db:
        caproverExtra:
            notExposeAsWebApp: 'true'
        image: postgres:$$cap_POSTGRES_VERSION
        environment:
            POSTGRES_DB: $$cap_POSTGRES_DB
            POSTGRES_PASSWORD: $$cap_POSTGRES_PASSWORD
            POSTGRES_USER: $$cap_POSTGRES_USER
        volumes:
            - $$cap_appname-db:/var/lib/postgresql/data

    $$cap_appname-cache:
        caproverExtra:
            notExposeAsWebApp: 'true'
            dockerfileLines:
                - FROM redis:$$cap_REDIS_VERSION
                - CMD redis-server --requirepass $$cap_REDIS_PASSWORD
        volumes:
            - $$cap_appname-cache:/data

caproverOneClickApp:
    displayName: Botpress
    isOfficial: true
    description: Open Source Platform For Developers To Build High-Quality Digital Assistants
    documentation: https://botpress.com/docs
    instructions:
        start: |-
            Botpress is a tool to simplify building chat bots for developers.
            The platform puts together the boilerplate code and infrastructure you need to get a chatbot up and running and gives a complete dev-friendly platform that ships with all the tools you need to build, deploy, and manage production-grade chat bots in record time.
        end: |-
            Botpress has been successfully deployed! It might take few moments before it's fully started.

            Please perform the following steps:

            1. Go to the **HTTP Settings** of `$$cap_appname` and **Enable WebSocket Support**
            2. Visit your Botpress instance at `http://$$cap_appname.$$cap_root_domain` and create your account
            3. Go to **Code Editor** and select **Configurations** > **Module Configurations** > `nlu.json` in the side bar
            4. Replace value for `ducklingURL` with `http://srv-captain--$$cap_appname-lang:8000`
            5. Replace value for `languageSources` > `endpoint` with `http://srv-captain--$$cap_appname-lang:3100`
            6. Restart `$$cap_appname` in CapRover by clicking on **Save & Update**

            Have fun with Botpress!
    variables:
        - id: $$cap_BOTPRESS_VERSION
          label: Version | Botpress
          description: Version of Botpress. Check out their Docker page for the valid tags https://hub.docker.com/r/botpress/server/tags
          defaultValue: v12_30_2
          validRegex: /.{1,}/
        - id: $$cap_POSTGRES_VERSION
          label: Version | PostgreSQL
          description: Version of PostgreSQL. Check out their Docker page for the valid tags https://hub.docker.com/_/postgres/tags
          defaultValue: 11.2-alpine
          validRegex: /.{1,}/
        - id: $$cap_REDIS_VERSION
          label: Version | Redis
          description: Version of Redis. Check out their Docker page for the valid tags https://hub.docker.com/_/redis/tags
          defaultValue: 5.0.5-alpine
          validRegex: /.{1,}/
        - id: $$cap_BOTPRESS_PRODUCTION
          label: General | Production Mode
          description: Whether to enable production mode.
          defaultValue: 'true'
          validRegex: /^(true|false)$/
        - id: $$cap_BOTPRESS_STORAGE
          label: General | Storage
          description: Storage destination used by BPFS to read and write files (global and bots). Either `disk` or `database`.
          defaultValue: database
          validRegex: /.{1,}/
        - id: $$cap_BOTPRESS_VERBOSITY_LEVEL
          label: General | Verbosity Level
          description: When set higher than `0`, Botpress will be more chatty when processing requests.
          defaultValue: '0'
          validRegex: /.{1,}/
        - id: $$cap_BOTPRESS_DECISION_MIN_CONFIDENCE
          label: General | Decision Minimum Confidence
          description: Minimum threshold required for the Decision Engine to elect a suggestion.
          defaultValue: '0.5'
          validRegex: /.{1,}/
        - id: $$cap_BOTPRESS_FAST_TEXT_VERBOSITY
          label: General | Fast Text Verbosity
          description: Level of verbosity that FastText will use when training models.
          defaultValue: '0'
          validRegex: /.{1,}/
        - id: $$cap_BOTPRESS_FAST_TEXT_CLEANUP_MS
          label: General | Fast Text Clean-Up
          description: Model will be kept in memory until it receives no messages to process for that duration. Defined in milliseconds.
          defaultValue: 60000
          validRegex: /.{1,}/
        - id: $$cap_POSTGRES_DB
          label: PostgreSQL | Name
          description: Name of the database.
          defaultValue: botpress
          validRegex: /.{1,}/
        - id: $$cap_POSTGRES_USER
          label: PostgreSQL | User
          description: Name of the database user.
          defaultValue: botpress
          validRegex: /.{1,}/
        - id: $$cap_POSTGRES_PASSWORD
          label: PostgreSQL | Password
          description: Password of the database user.
          defaultValue: $$cap_gen_random_hex(16)
          validRegex: /.{1,}/
        - id: $$cap_REDIS_PASSWORD
          label: Redis | Password
          description: Password for Redis.
          defaultValue: $$cap_gen_random_hex(16)
          validRegex: /.{1,}/
</example>

<example>
captainVersion: 4
services:
    $$cap_appname:
        caproverExtra:
            notExposeAsWebApp: 'true'
            dockerfileLines:
                - FROM cloudflare/cloudflared:$$cap_cloudflared_version
                - ENTRYPOINT ["cloudflared"]
                - CMD ["tunnel", "--no-autoupdate", "run", "--token", "$$cap_cloudflared_token"]
        restart: always
caproverOneClickApp:
    variables:
        - id: $$cap_cloudflared_token
          label: Cloudflare Tunnel Token
          defaultValue: ''
          description: 'Your Cloudflare tunnel token. This is required to authenticate the tunnel with Cloudflare.'
        - id: $$cap_cloudflared_version
          label: Cloudflare Cloudflared Version
          defaultValue: '1517-bb29a0e19437'
          description: 'The version of Cloudflare Cloudflared to use.'
    instructions:
        start: >-
            This CapRover app deploys a Cloudflare tunnel, allowing you to securely expose your services to the internet. Make sure to provide the Cloudflare Tunnel Token when you deploy this app.
        end: >-
            The Cloudflare tunnel is now running. Configure your Cloudflare DNS to point to this tunnel for secure, encrypted traffic. This setup ensures your applications are accessible through Cloudflare's network.
    displayName: 'Cloudflare Tunnel'
    isOfficial: true
    description: 'Secure your web servers with a Cloudflare Tunnel. This creates an encrypted connection without exposing your server directly.'
    documentation: 'For more information on Cloudflared and how to use it, visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps'
</example>

<example>
captainVersion: 4
services:
    $$cap_appname-db:
        image: postgres:$$cap_postgres_version
        environment:
            POSTGRES_DB: $$cap_postgres_db
            POSTGRES_USER: $$cap_postgres_user
            POSTGRES_PASSWORD: $$cap_postgres_password
        volumes:
            - '$$cap_appname-db-data:/var/lib/postgresql/data'
        caproverExtra:
            notExposeAsWebApp: 'true'

    $$cap_appname:
        environment:
            CONFIG_JSON: '{"serverRoot":"http://srv-captain--$$cap_appname:8000","port":8000,"dbtype":"postgres","dbconfig":"postgres://$$cap_postgres_user:$$cap_postgres_password@srv-captain--$$cap_appname-db/$$cap_postgres_db?sslmode=disable&connect_timeout=10","postgres_dbconfig":"dbname=$$cap_postgres_db sslmode=disable","useSSL":false,"webpath":"./pack","filespath":"./files","telemetry":false,"session_expire_time":2592000,"session_refresh_time":18000,"localOnly":false,"enableLocalMode":true,"localModeSocketLocation":"/var/tmp/focalboard_local.socket"}'
        depends_on:
            - $$cap_appname-db
        caproverExtra:
            containerHttpPort: '8000'
            dockerfileLines:
                - FROM mattermost/focalboard:$$cap_focalboard_version
                - CMD printenv CONFIG_JSON > /opt/focalboard/config.json && /opt/focalboard/bin/focalboard-server

caproverOneClickApp:
    variables:
        - id: $$cap_focalboard_version
          label: Focalboard Version
          defaultValue: 0.6.5
          description: 'Check out their docker page for the valid tags https://hub.docker.com/r/mattermost/focalboard/tags'
        - id: $$cap_postgres_version
          label: Postgres Version
          defaultValue: 9.6.21
          description: 'Check out their docker page for the valid tags https://hub.docker.com/_/postgres?tab=tags'
        - id: $$cap_postgres_db
          label: Postgres Database
          defaultValue: boards
        - id: $$cap_postgres_user
          label: Postgres User
          defaultValue: boardsuser
        - id: $$cap_postgres_password
          label: Postgres Password
          defaultValue: $$cap_gen_random_hex(16)

    instructions:
        start: >-
            Focalboard is an open source, self-hosted alternative to Trello, Notion, and Asana.
            For more info visit https://www.focalboard.com/
        end: |-
            Focalboard has been successfully deployed!

            --------------------------------------------

            Before you proceed, please enable Websocket Support
            https://$$cap_root_domain/#/apps/details/$$cap_appname

            --------------------------------------------

            App is available as http://$$cap_appname.$$cap_root_domain
    displayName: Focalboard
    isOfficial: false
    description: >-
        Focalboard is an open source, self-hosted alternative to Trello, Notion, and Asana.
    documentation: >-
        This docker-compose is taken from
        https://github.com/mattermost/focalboard/blob/main/docker/docker-compose-db-nginx.yml
</example>
</examples>
```
